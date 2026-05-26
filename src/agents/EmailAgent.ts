import { Agent } from "../agent";
import { GmailTool } from "../tools/email";
import { AgentResult } from "../types";

export class EmailAgent extends Agent {
  private tool = new GmailTool();

  constructor() {
    super({
      id: "email-agent-01",
      role: "email-reader",
      model: "gpt-4o-mini",
      maxTokens: 2000,
      temperature: 0.2,
      systemPrompt: `You are an Email Assistant. Read and categorize emails into:
- URGENT: requires immediate action
- WORK: professional/work-related
- PERSONAL: friends or family
- NEWSLETTER: subscriptions and marketing
- SPAM: unwanted
- OTHER: doesn't fit above categories

Format your response in markdown:
1. Start with a summary line: "X unread emails: Y urgent, Z work, ..."
2. List URGENT emails prominently at the top
3. Then list all emails: [CATEGORY] **Subject** | From | Date | one-line summary`,
    });
  }

  async run(input: string): Promise<AgentResult> {
    const start = Date.now();
    let params: { limit?: number } = {};
    try { params = JSON.parse(input); } catch { /* use defaults */ }

    let emails: Awaited<ReturnType<GmailTool["getUnreadEmails"]>>;

    try {
      emails = await this.tool.getUnreadEmails(params.limit ?? 20);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        agentId: this.config.id,
        role: this.config.role,
        output: `Email access failed: ${msg}`,
        tokensUsed: 0,
        durationMs: Date.now() - start,
      };
    }

    if (!emails.length) {
      return {
        agentId: this.config.id,
        role: this.config.role,
        output: "No unread emails.",
        tokensUsed: 0,
        durationMs: Date.now() - start,
      };
    }

    const emailText = emails.map(e => {
      const h = e.payload?.headers ?? [];
      const get = (name: string) => h.find(x => x.name === name)?.value ?? "";
      return `Subject: ${get("Subject") || "(no subject)"}\nFrom: ${get("From")}\nDate: ${get("Date")}\nSnippet: ${e.snippet ?? ""}`;
    }).join("\n\n---\n\n");

    return super.run(`Categorize and summarize these ${emails.length} emails:\n\n${emailText}`);
  }
}
