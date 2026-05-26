import axios from "axios";
import { GitHubEvent } from "../types";

export class GitHubTool {
  private readonly base = "https://api.github.com";
  private readonly token = process.env.GITHUB_TOKEN;

  private headers(): Record<string, string> {
    const h: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    return h;
  }

  async getActivity(repo: string, since?: string): Promise<GitHubEvent[]> {
    const res = await axios.get(`${this.base}/repos/${repo}/events?per_page=30`, {
      headers: this.headers(),
      timeout: 10_000,
    });

    let events: unknown[] = res.data;
    if (since) {
      events = events.filter(
        (e: unknown) =>
          typeof e === "object" &&
          e !== null &&
          "created_at" in e &&
          new Date((e as { created_at: string }).created_at) > new Date(since)
      );
    }

    return (events as Record<string, unknown>[]).map(e => ({
      type: String(e.type ?? ""),
      title: this.extractTitle(e),
      url: this.extractUrl(e),
      author: String((e.actor as Record<string, unknown>)?.login ?? "unknown"),
      createdAt: String(e.created_at ?? ""),
    }));
  }

  async getRepoInfo(repo: string): Promise<{ stars: number; forks: number; openIssues: number }> {
    const res = await axios.get(`${this.base}/repos/${repo}`, {
      headers: this.headers(),
      timeout: 10_000,
    });
    const d = res.data;
    return {
      stars: d.stargazers_count ?? 0,
      forks: d.forks_count ?? 0,
      openIssues: d.open_issues_count ?? 0,
    };
  }

  private extractTitle(e: Record<string, unknown>): string {
    const p = e.payload as Record<string, unknown> | undefined;
    if (!p) return String(e.type ?? "");
    switch (e.type) {
      case "PushEvent": {
        const commits = p.commits as unknown[];
        const first = commits?.[0] as Record<string, unknown> | undefined;
        return String(first?.message ?? "push");
      }
      case "IssuesEvent": {
        const issue = p.issue as Record<string, unknown>;
        return `[${p.action}] ${issue?.title}`;
      }
      case "PullRequestEvent": {
        const pr = p.pull_request as Record<string, unknown>;
        return `[${p.action}] ${pr?.title}`;
      }
      case "CreateEvent":
        return `Created ${p.ref_type}: ${p.ref}`;
      case "ReleaseEvent": {
        const rel = p.release as Record<string, unknown>;
        return `Release: ${rel?.tag_name}`;
      }
      default:
        return String(e.type ?? "");
    }
  }

  private extractUrl(e: Record<string, unknown>): string {
    const p = e.payload as Record<string, unknown> | undefined;
    if (!p) return `https://github.com/${(e.repo as Record<string, unknown>)?.name ?? ""}`;
    switch (e.type) {
      case "IssuesEvent": return String((p.issue as Record<string, unknown>)?.html_url ?? "");
      case "PullRequestEvent": return String((p.pull_request as Record<string, unknown>)?.html_url ?? "");
      default: return `https://github.com/${(e.repo as Record<string, unknown>)?.name ?? ""}`;
    }
  }
}
