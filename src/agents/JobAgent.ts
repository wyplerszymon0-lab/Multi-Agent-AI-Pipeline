import { Agent } from "../agent";
import { JobBoardTool } from "../tools/jobboards";
import { StateManager } from "../state/StateManager";
import { AgentResult } from "../types";

export class JobAgent extends Agent {
  private tool = new JobBoardTool();
  private state = new StateManager();

  constructor() {
    super({
      id: "job-agent-01",
      role: "job-monitor",
      model: "gpt-4o-mini",
      maxTokens: 1500,
      temperature: 0.2,
      systemPrompt: `You are a Job Offer Monitor. Summarize new job listings in markdown.
- Group by role type (Frontend, Backend, Fullstack, AI/ML, DevOps, etc.)
- For each job show: title, company, location, salary (if available), and link
- Flag remote positions clearly
- Be selective — highlight the most relevant and promising opportunities
- End with a count: "X new listings from Y sources"`,
    });
  }

  async run(input: string): Promise<AgentResult> {
    const start = Date.now();
    let params: { keywords?: string[] } = {};
    try { params = JSON.parse(input); } catch { /* use defaults */ }

    const keywords = params.keywords?.length
      ? params.keywords
      : (this.state.get("jobKeywords") as string[]);

    const allJobs = await this.tool.fetchJobs(keywords);
    const seenIds = this.state.get("seenJobIds") as string[];
    const newJobs = allJobs.filter(j => !seenIds.includes(j.id));

    if (!newJobs.length) {
      return {
        agentId: this.config.id,
        role: this.config.role,
        output: `No new job listings found for: **${keywords.join(", ")}**\n(${allJobs.length} total checked)`,
        tokensUsed: 0,
        durationMs: Date.now() - start,
      };
    }

    this.state.set("seenJobIds", [...seenIds, ...newJobs.map(j => j.id)].slice(-500));

    const jobsText = newJobs
      .slice(0, 25)
      .map(j =>
        `**${j.title}** @ ${j.company}\nLocation: ${j.location} | Tags: ${j.tags.join(", ")}` +
        (j.salary ? ` | Salary: ${j.salary}` : "") +
        `\nURL: ${j.url}\nPosted: ${j.postedAt}`
      )
      .join("\n\n---\n\n");

    return super.run(
      `Summarize these ${newJobs.length} new job listings (keywords: ${keywords.join(", ")}):\n\n${jobsText}`
    );
  }
}
