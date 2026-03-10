import { Agent } from "./agent";

export class ResearcherAgent extends Agent {
  constructor() {
    super({
      id: "researcher-01",
      role: "researcher",
      model: "gpt-4o-mini",
      maxTokens: 1000,
      temperature: 0.3,
      systemPrompt: `You are a Research Agent specialized in gathering and organizing information.
Your job is to:
- Research the given topic thoroughly
- Identify key facts, trends, and relevant data points
- Structure findings in clear sections
- Be objective and fact-based
- Always cite what kind of sources would support each claim
Output your research in markdown format with clear sections.`,
    });
  }
}

export class AnalystAgent extends Agent {
  constructor() {
    super({
      id: "analyst-01",
      role: "analyst",
      model: "gpt-4o-mini",
      maxTokens: 1000,
      temperature: 0.4,
      systemPrompt: `You are an Analysis Agent specialized in critical thinking and pattern recognition.
Your job is to:
- Analyze research findings provided to you
- Identify patterns, opportunities, and risks
- Provide data-driven insights and conclusions
- Compare and contrast different aspects
- Highlight the most important takeaways
Be analytical, precise and structured in your output. Use markdown format.`,
    });
  }
}

export class WriterAgent extends Agent {
  constructor() {
    super({
      id: "writer-01",
      role: "writer",
      model: "gpt-4o-mini",
      maxTokens: 1200,
      temperature: 0.6,
      systemPrompt: `You are a Writer Agent specialized in creating clear, engaging content.
Your job is to:
- Take research and analysis and turn it into a polished report
- Write in a clear, professional yet engaging style
- Structure content with a proper introduction, body and conclusion
- Make complex topics accessible
- Create a compelling narrative around the data
Output a complete, well-formatted markdown report ready for publication.`,
    });
  }
}
