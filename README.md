Multi-Agent AI Pipeline
A production-grade multi-agent system built with TypeScript and JavaScript where specialized AI agents collaborate to research, analyze and write comprehensive reports on any topic.
User Input (topic)
      ↓
 Orchestrator
      ↓
┌──────────────────────────────────────────────┐
│   Researcher  →   Analyst  →    Writer  │
└──────────────────────────────────────────────┘
      ↓
 Final Report (Markdown)

How It Works
AgentLanguageRoleOrchestratorTypeScriptCoordinates all agents and manages pipeline flowResearcherTypeScriptGathers and structures information on the topicAnalystTypeScriptFinds patterns, insights and key takeawaysWriterTypeScriptProduces a polished, publication-ready reportLoggerJavaScriptColored terminal output and pipeline monitoring
Each agent has its own system prompt, temperature and token budget — optimized for its specific role.

Demo Output
⚡ MULTI-AGENT PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Topic: The future of AI agents in software development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[12:00:01]   [RESEARCHER] Researching topic...
────────────────────────────────────────────────────────────
  ## Key Findings
  - AI agents are transforming how developers write code
  ... (24 more lines)
────────────────────────────────────────────────────────────
[12:00:08]  [RESEARCHER] Done — 843 tokens · 7120ms

[12:00:08]   [ANALYST] Analyzing research findings...
────────────────────────────────────────────────────────────
  ## Critical Insights
  - 73% of developers already use AI tools daily
  ... (18 more lines)
────────────────────────────────────────────────────────────
[12:00:14]  [ANALYST] Done — 921 tokens · 6340ms

[12:00:14]    [WRITER] Writing final report...
[12:00:22]  [WRITER] Done — 1083 tokens · 8210ms

 PIPELINE COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total tokens used: 2847
Total time:        21670ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Getting Started
Prerequisites

Node.js 18+
OpenAI API key — get one at platform.openai.com

Installation
bashgit clone https://github.com/wyplerszymon0-lab/multi-agent-pipeline.git
cd multi-agent-pipeline
npm install
Configuration
Create a .env file in the root directory:
OPENAI_API_KEY=your_openai_api_key_here
Run
bash# Default topic
npm run dev

# Custom topic
npx ts-node src/index.ts "The impact of quantum computing on cybersecurity"

# Build and run production
npm run build
node dist/index.js "Your topic here"

Project Structure
multi-agent-pipeline/
├── src/
│   ├── index.ts           # Entry point
│   ├── orchestrator.ts    # Pipeline coordinator
│   ├── agent.ts           # Base Agent class
│   ├── agents.ts          # Researcher, Analyst, Writer
│   ├── logger.js          # Colored terminal logger (JS)
│   └── types.ts           # TypeScript interfaces & types
├── reports/               # Generated markdown reports (auto-created)
├── package.json
├── tsconfig.json
├── .gitignore
└── .env                   # Your API key — never commit this!

Agent Configuration
AgentModelTemperatureMax TokensResearchergpt-4o-mini0.31000Analystgpt-4o-mini0.41000Writergpt-4o-mini0.61200
Lower temperature = more factual. Higher temperature = more creative.

Output
Every pipeline run saves a full markdown report to the reports/ folder:
reports/
└── report_1741234567890.md
The report contains all three stages — research, analysis and the final polished write-up.

Example Topics
bashnpx ts-node src/index.ts "The rise of Go programming language"
npx ts-node src/index.ts "How blockchain is changing supply chains"
npx ts-node src/index.ts "Future of remote work in tech companies"
npx ts-node src/index.ts "Python vs TypeScript for AI development"

Tech Stack

TypeScript — strongly typed agent architecture
JavaScript — logger utility module
OpenAI API — GPT-4o-mini for all agents
Node.js — runtime environment
dotenv — environment variable management
chalk — colored terminal output


Author
Szymon Wypler — @wyplerszymon0-lab

License
MIT License — feel free to use, modify and distribute.

Disclaimer
This project uses the OpenAI API which is a paid service. Each pipeline run uses approximately 2500–4000 tokens depending on the topic (~$0.001–0.002 per run with gpt-4o-mini).
