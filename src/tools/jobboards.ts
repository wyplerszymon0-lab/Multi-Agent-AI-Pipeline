import axios from "axios";
import { JobOffer } from "../types";

export class JobBoardTool {
  async fetchJobs(keywords: string[], _remote = true): Promise<JobOffer[]> {
    const results = await Promise.allSettled([
      this.fetchRemoteOK(keywords),
      this.fetchHackerNewsJobs(keywords),
    ]);

    return results.flatMap(r => (r.status === "fulfilled" ? r.value : []));
  }

  private async fetchRemoteOK(keywords: string[]): Promise<JobOffer[]> {
    const res = await axios.get<unknown[]>("https://remoteok.com/api", {
      headers: { "User-Agent": "personal-agent/1.0" },
      timeout: 12_000,
    });

    return (res.data as Record<string, unknown>[])
      .filter(job => job.id != null)
      .filter(job => {
        const text = `${job.position} ${job.company} ${(job.tags as string[] ?? []).join(" ")}`.toLowerCase();
        return keywords.some(kw => text.includes(kw.toLowerCase()));
      })
      .map(job => ({
        id: String(job.id),
        title: String(job.position ?? "Unknown"),
        company: String(job.company ?? "Unknown"),
        location: String(job.location ?? "Remote"),
        url: String(job.url ?? `https://remoteok.com/l/${job.id}`),
        tags: (job.tags as string[]) ?? [],
        salary: job.salary ? String(job.salary) : undefined,
        postedAt: String(job.date ?? new Date().toISOString()),
        source: "remoteok",
      }));
  }

  private async fetchHackerNewsJobs(keywords: string[]): Promise<JobOffer[]> {
    const res = await axios.get<{ hits: Record<string, unknown>[] }>(
      "https://hn.algolia.com/api/v1/search_by_date?tags=job&hitsPerPage=100",
      { timeout: 10_000 }
    );

    return (res.data.hits ?? [])
      .filter(hit => {
        const text = String(hit.title ?? hit.story_text ?? "").toLowerCase();
        return keywords.some(kw => text.includes(kw.toLowerCase()));
      })
      .map(hit => ({
        id: String(hit.objectID),
        title: String(hit.title ?? "HN Job"),
        company: String(hit.author ?? "Unknown"),
        location: "See post",
        url: String(hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`),
        tags: keywords.filter(kw =>
          String(hit.title ?? "").toLowerCase().includes(kw.toLowerCase())
        ),
        postedAt: String(hit.created_at ?? new Date().toISOString()),
        source: "hackernews",
      }));
  }
}
