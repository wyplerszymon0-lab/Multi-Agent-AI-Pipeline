import { Agent } from "../agent";
import { GitHubTool } from "../tools/github";
import { StateManager } from "../state/StateManager";
import { AgentResult } from "../types";

export class GitHubAgent extends Agent {
  private tool = new GitHubTool();
  private state = new StateManager();

  constructor() {
    super({
      id: "github-agent-01",
      role: "github-monitor",
      model: "gpt-4o-mini",
      maxTokens: 1500,
      temperature: 0.2,
      systemPrompt: `You are a GitHub Activity Monitor. Summarize repository activity concisely in markdown.
- Group events by type (commits, issues, PRs, releases)
- Highlight anything important (new release, security issue, breaking change)
- Show author and link for each event
- If no activity, say so clearly`,
    });
  }

  async run(input: string): Promise<AgentResult> {
    const start = Date.now();
    let params: { repos?: string[] } = {};
    try { params = JSON.parse(input); } catch { /* use defaults */ }

    const repos = params.repos?.length
      ? params.repos
      : (this.state.get("watchedRepos") as string[]);

    if (!repos.length) {
      return {
        agentId: this.config.id,
        role: this.config.role,
        output: "No repositories configured.\nAdd one with: **watch github <owner>/<repo>**",
        tokensUsed: 0,
        durationMs: Date.now() - start,
      };
    }

    const since = this.state.get("lastGithubCheck");
    const sections: string[] = [];

    for (const repo of repos) {
      try {
        const [events, info] = await Promise.all([
          this.tool.getActivity(repo, since),
          this.tool.getRepoInfo(repo),
        ]);
        sections.push(
          `### ${repo} (★${info.stars} · ${info.openIssues} open issues)\n` +
          (events.length
            ? events.map(e => `- [${e.type}] **${e.title}** by ${e.author} — ${e.url}`).join("\n")
            : "- No new activity since last check")
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        sections.push(`### ${repo}\n- Error fetching activity: ${msg}`);
      }
    }

    this.state.set("lastGithubCheck", new Date().toISOString());
    const rawData = sections.join("\n\n");

    return super.run(`Summarize this GitHub activity report:\n\n${rawData}`);
  }
}
