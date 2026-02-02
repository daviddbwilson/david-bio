# Lessons from Building Reliable Background Agents

*15 min read*

When a background agent starts hallucinating at 3am, there's nobody around to fix it.

Most agents need to be smarter and faster. But **background agents need to be reliable**.

Here's the problem:
- Better prompts aren't enough
- Deterministic workflows are too inflexible (hello, my brittle little n8n flow)
- Supervision by other LLMs – Opus watching Opus watching Opus – isn't practical either

So how do you make background agents reliable?

We built background agents that automate recurring work for dozens of organizations and learned a lot in the process. One media org ran their entire content operation on our system: monitoring primary sources, selecting stories, doing additional research, writing in their house style, finding or creating images, and publishing daily. They paid thousands a month for work that would have cost many times more with staff.

Here's what we did:

- **Make everything a tool call** – including stopping. You always know what state the agent is in at 3am.
- **Treat tool metadata as prompts** – Renaming a tool parameter from `draft` to `final_draft` changed behavior more than paragraphs of instructions.
- **Use evals to iterate fast** – We spent 2.5 days building evals infrastructure. It paid for itself in 24 hours.
- **Design around known failure modes** – Repetition and omission were our "cardinal sins". We built quality control, memory, and everything else specifically to prevent them.
- **Split quality control into two layers** – Fast and cheap binary checks that always run, plus optional review the agent controls.
- **Use multiple (simple) memory approaches** – Key-value storage, successful execution traces injected into context, an "ask the oracle" tool, and "feedback chains" from human reviews.
- **Match models to tasks** – orchestration, polish, and review each need different cost/quality/latency trade-offs.
- **Set hard guardrails** – Max iterations, timeouts, token caps. Without them, agents burn resources overnight.

---

## 1. The Basic Setup

Our agent is just an LLM – Claude Sonnet – in a loop. The core loop is around 50 lines of Python: call the LLM, execute any tool calls, repeat until it stops itself.

```python
while should_continue():
    response = call_llm(messages, tools)
    results = await execute_tool_calls(response.tool_calls)
    messages.append(response, results)
```

Everything described in this post was built on top of that loop.

Every time we've tried building with an existing agent framework, we've ended up abandoning it to change something important about how it works with tools, memory, or context.

We give the agent access to ~40 tools: web search, URL scraping, code sandboxes, image generation, plus OAuth integrations for Gmail, Slack, Sheets, Linear, GitHub, Notion, and more from Composio.dev.

The agent's task definition is a "playbook" – basically identical to a Claude Code skill. It reads like a job description, not code. (We shipped this before Claude Code had skills; otherwise we'd have just called it a "skill.") Text-based playbooks/skills are easier to create, understand, and edit than more deterministic node-based flows. (We originally built a node-based AI editor: [app.hunch.tools](https://app.hunch.tools).)

We kept playbooks extremely light, focused on *why* and *what* the agent needed to deliver with very little information on *how* – preferring to give ever-smarter AI models more room to make their own decisions… but also more room to go off track. This felt exciting and like the right trade-off: let agents learn from experience and stay out of their way if you can.

We created a second agent to chat with users and create background agents for them – in other words, to write and test playbooks. The chat agent shares 90% of the background agent's DNA (prompts and tools), but we optimized it for low latency instead of high reliability and didn't give it many of the capabilities/limitations described below.

---

## 2. Make Everything a Tool Call

When a background agent stops at 3am, you need to know: Is it done? Is it waiting for something? Is it stuck?

We solve this by making the agent a state machine where every state is preceded by a tool call.

Want to tell the user something? Call `send_message`. Need to think through a problem? Call `think`. Done with the task? Call `stop` with a reason.

Because everything the agent does happens through a tool call, we always know exactly what state it is in and can easily deal with it if it goes off track.

Our `stop` tool requires a reason: `COMPLETE`, `ABORT`, or `WAITING_INPUT`. Each triggers different behavior:

- Completed work gets published
- Waiting states escalate to users for input via Slack or email – including when the agent needs an OAuth integration it doesn't have access to
- Aborts log why the task was impossible

Having `ABORT` as an explicit option turned out to be critical. It lets the agent fail gracefully rather than hallucinating a solution to an impossible problem.

Before the agent can stop, we check for pending work. If the agent tries to call `stop` while other tool calls are still in flight, or before expected output was produced, we reject the stop and tell it to finish first. This catches a whole class of bugs where agents quit early.

We enforce this through the system prompt: "You MUST terminate with the stop tool or you'll iterate forever wasting resources." Some models handle this better than others – Sonnet took to it naturally.

---

## 3. Tool Metadata Are Prompts

One of the agent's tools is a "Polish" tool for refining written output: a different LLM (Gemini Pro) with its own custom prompt. But we saw that the agent would hand over rough notes and expect the Polish tool to do way too much work. Adding paragraphs of instructions to the system prompt barely improved the behavior.

Renaming the Polish tool's input parameter from `draft` to `final_draft` solved the problem instantly. The agent did much more work on drafts before calling the tool, without any of the additional prompting.

Tool metadata – names, descriptions, parameter names – *are* prompts. They're text loaded into your agent's context. They're easy to overlook because they might come from a third-party service. But they have outsized impact on agent behavior.

We audited and rewrote all of our tool metadata, proxying third-party tools where needed.

Caution: generic API wrappers can be dangerous tools. We connected an agent to Gmail through an MCP server. By default, the API returns base64-encoded attachments. The first time someone's inbox had a PDF, the agent dumped megabytes of garbage into the context window and crashed. You can't just hand an agent an API and hope for the best.

---

## 4. Evaluations Let Us Iterate Fast

A lot has been written about agent evals already. I'll add some specifics from our experience:

We spent 2.5 days building a custom evals infra and UI. It paid for itself in less than 24 hours.

We had two types of evals, all run with LLMs:

First, and most indispensable, pre-deployment evals. We were iterating on the agent prompt multiple times a day during the first few weeks – tweaking how it thought and communicated, tools, memory, and more – and our suite of ~35 evals caught regressions before they hit production.

Second, production evals. These were mostly lightweight automated quality checks that ran on every set of agent logs. We ran more in-depth evaluations (more expensive models!) on the first few runs of new playbooks too, just to make sure the agent was adapting well to new use cases.

Our UI let us define test cases for the background agent (playbook or initial user request + context info + expected behavior), assign which checks should run, and batch-run everything when we changed prompts. We made it super easy to add new evals for both the background agent and chat agent.

Something we'd have added given more time: automated user context in tests. Behavior differs for new users vs. users with history, because that history/memory is present in the agent's context. We had to add fixtures to test different user states.

---

## 5. The Cardinal Sins

Our work with early customers showed us how easily background agents slip into two unforgivable failure modes:

- **repetition** – sending the same news digest two days in a row
- **omission** – forgetting to include a critical source or step of work

Almost everything else is fixable: tone can be adjusted, details can be added, formatting can be tweaked. But these two "cardinal sins" destroy trust.

This framing shaped how we designed the surrounding system. The agent doesn't store memories because "learning makes it better." It stores memories to avoid the sins. We added checks and reviews specifically to catch sins that slipped through.

The system prompt emphasizes the sins by name: "Avoid the cardinal sins: repetition [when monitoring resources and when creating content] and omission [of expected work]." This worked better than vague instructions about "being thorough" or "maintaining quality."

---

## 6. Two Layers of Quality Control

One of our first ideas was obvious: use a separate "Reviewer LLM" to gate all output until the reviewer confirms the task is done properly.

But if you tell an LLM to find problems, it will *always* find problems!

Even after tons of iterations on the prompts, the mandatory Reviewer would nitpick endlessly. The agent would produce good output, the Reviewer would flag something minor, the agent would fix it, the Reviewer would find something else. Back and forth forever, consuming tokens, taking time, often producing worse output than the original.

We solve this by splitting quality control into two layers.

**Binary checks that always run.** Fast, cheap, pass or fail. GPT-4.1 mini works great for this.

Our checks:

- **No plagiarism**: Compare output to source material. Original or regurgitated?
- **URL validity**: Does this URL appear in search history, or was it hallucinated?
- **No repetition**: Compare to memory. E.g. same item we researched yesterday?
- **No-op detection**: Is the agent trying to send "I completed the task" as actual output?

These checks were initially part of our eval suite for testing new prompts. We built an eval system that enabled us to add more checks easily.

Running the same checks in-line while the agent was working is incredibly effective. More agent builders should try this pattern!

By the way, this is another benefit of forcing the agent to call specific tools for every action: we deterministically run these checks when the agent uses the `send_output` tool.

**Optional review.** We let the agent *choose* whether to call the Reviewer as a tool. The Reviewer's instructions: "You're a helpful peer, not a critic"… "Don't be a dick. We just want to make sure the output is good, complete, and correct." Because the agent decided whether to act on feedback, the loop can't run forever.

---

## 7. Memory: Keep It Simple

Our usual approach is: try the simplest thing first, because it often works.

I'm not sure why we were seduced by complex memory systems early on. Maybe because we knew how important it was and really wanted to get it right. We tried graph databases, JSON objects, structured updates, diff operations. Each was overwrought. The agent would lose track of schemas, make conflicting changes, generate malformed data… And when something went wrong, debugging was hard.

Simple key-value storage works: natural keys like `2025-11-15-competitor-pricing` or `github-pr-query-success`. The agent can recall and add entries, but we don't allow it to freely edit existing ones. In our initial testing, we found the agent easily became like Lenny from *Memento*: losing useful memories and replacing them with over-fitted, selective ones.

A separate background job periodically compresses and prunes memories with a cheap LLM.

---

## 8. Memory: Successful Execution Traces

One agent needed to create GitHub pull requests via GraphQL. That API is finicky – easy to get queries subtly wrong. Other agents searched Google Drive for meeting transcripts but initially used wrong search terms.

The agents are good at retrying and they eventually figured out how to do these things. But you don't want them re-learning how to tie their shoelaces every run.

When an agent fails initially but eventually succeeds, we have it save the successful tool calls as "traces." We inject successful traces directly into context on subsequent runs.

After a few runs, agents have working examples of every query or action they need. More reliable execution, fewer iterations, less junk in the context window, lower costs.

---

## 9. Memory: Ask The Oracle

For agents dealing with lots of source material – user history, company docs, past conversations – we built an "Oracle" tool.

The Oracle is a separate LLM with all relevant information in context. We use Gemini Flash: fast, cheap, handles huge context well. The agent asks questions in natural language: "What's this user's LinkedIn URL?" or "What topics have we covered this week?"

The Oracle has one critical constraint: it **must back up every answer with verbatim quotes from sources.**

If it can't quote a source, it has to say "I don't know." This worked incredibly well to reduce hallucinations.

This approach also sidesteps typical RAG headaches: no chunking strategy to tune, no embedding model to choose, no retrieval relevance to debug. Just a big context window and a requirement to show your work. For our dataset sizes, it just worked.

Again: try the simple thing first.

---

## 10. Memory: Feedback from Humans in the Loop

Users can review every output. When they give feedback, three things happen:

First, the specific output gets fixed.

Second, we capture the chain: original output → feedback → revised output. These chains get injected into future runs as context. The prompt frames them carefully: "These are examples of previous feedback that may or may not be relevant. Defer to the main task definition if there's conflict."

This matters. Maybe the user wanted a shorter summary that one time. Doesn't mean all summaries should be shorter. By framing past feedback as context rather than instruction, the agent can use judgment about when to apply it.

Over time, agents internalized preferences they were never explicitly taught – tone, formatting, edge case handling – all from accumulated feedback chains.

Third, if feedback indicated a consistent pattern, the agent updates the playbook itself, making the change permanent.

---

## 11. Different Models for Different Jobs

I've mentioned this already, but it's worth stating clearly: we use different models for different sub-tasks.

The main agent is Sonnet. The Polish tool uses Gemini Pro – we found it better at natural-sounding prose. The Reviewer also uses Gemini Pro, because a different model family seemed less blind to Sonnet's particular tics – although I think Opus would do well now. Memory compression and fast checks use cheap models like Gemini Flash and GPT-4.1 mini (and even GPT-4o mini).

We chose each model for its specific job based mostly on the tradeoff between quality and cost – latency was less of a concern. Sonnet is great at orchestration and tool use, but overkill for binary pass/fail checks – and ten times more expensive.

This also meant we could upgrade or downgrade individual components without touching the others.

---

## 12. Guardrails

Not groundbreaking, but every agent needs hard limits. Here's what we use:

- **Max iterations**: 30 per run standard, 50 for power users. Without a ceiling, confused agents burn through budgets overnight.
- **Timeout**: 8 minutes per run.
- **Token caps on tool outputs**: ~30-50K tokens. An API that returns unbounded data will overflow your context.
- **Prompt caching**: Anthropic's cache control to cache the system prompt across iterations. Cuts costs significantly on long runs.
- **Parallel tool calls**: The system prompt instructed agents to make multiple independent tool calls in a single response. Check three websites at once, not one by one.

---

## What We Didn't Solve

We built this in a three-month sprint at the end of our runway. The patterns worked – we had paying customers running real workflows in production – but we ran out of time before solving everything.

**Time to first value was too long.**

Setting up useful background agents takes work: permissions, integrations, configuration. It's pretty high friction.

Even worse, many useful agents are monitors – they watch for changes. First run just establishes a baseline. So users would start setup, wait through a boring first run, then see nothing useful. Or they'd tab away during setup and forget to come back.

We tried front-loading configuration versus just-in-time setup. Neither cracked the Day Zero problem.

**Users didn't know what to automate.**

Users struggled to form a mental model of what the agent could do, and found it hard to figure out what to delegate. We could show them tools, but that didn't translate to "here's what I should delegate."

We built onboarding that looked at their LinkedIn profile, inferred their role, suggested relevant agents. It helped, but not enough. The users who got the most value came in with a specific workflow already in mind. Few people have that clarity.

---

## The Core Lesson

You can't prompt your way to reliable background agents. You need the right architecture around the LLM.

In our experience, background agents need:

- **Observable state** – You need to know what happened at 3am.
- **Graceful failure paths** – Without explicit abort or escalation options, agents hallucinate solutions to impossible problems.
- **Sensible quality control** – Catching mistakes matters, but mandatory reviews can loop forever.
- **Memory that doesn't corrupt itself** – Multiple simple approaches can work well.
- **The right model for each subtask** – Orchestration, polish, review, and checks have different cost/quality trade-offs.
- **Hard limits** – Without guardrails on iterations, time, and tokens, agents burn through budgets overnight.

The underlying AI models will keep improving. Some of this architecture will become less necessary, or better approaches will emerge.

But right now, if you're building background agents, these patterns will help make them reliable.

---

*This is based on work building [Overclock.work](https://overclock.work)'s background agents in late 2025. The team included [Ross Douglas](https://www.linkedin.com/in/rsdouglas) and [Alex Leibhammer](https://www.linkedin.com/in/alexleibhammer/).*
