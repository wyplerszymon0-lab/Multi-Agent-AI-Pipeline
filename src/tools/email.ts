import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const CREDENTIALS_PATH = path.join(process.cwd(), "data", "gmail_credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "data", "gmail_token.json");
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

type GmailMessage = {
  id: string;
  snippet?: string;
  payload?: { headers?: { name: string; value: string }[] };
};

export class GmailTool {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private gmail: any = null;

  async authenticate(): Promise<void> {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(
        `Gmail credentials missing.\nAdd OAuth2 credentials to: ${CREDENTIALS_PATH}\nSee: https://developers.google.com/gmail/api/quickstart/nodejs`
      );
    }

    // Lazy import googleapis to avoid startup cost when not needed
    const { google } = await import("googleapis");
    const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_secret, client_id, redirect_uris } =
      creds.installed ?? creds.web;
    const oauth2 = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    if (fs.existsSync(TOKEN_PATH)) {
      oauth2.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8")));
      this.gmail = google.gmail({ version: "v1", auth: oauth2 });
      return;
    }

    const authUrl = oauth2.generateAuthUrl({ access_type: "offline", scope: SCOPES });
    console.log("\nVisit this URL to authorize Gmail access:\n" + authUrl + "\n");
    const code = await this.prompt("Paste authorization code: ");
    const { tokens } = await oauth2.getToken(code.trim());
    oauth2.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens), "utf-8");
    this.gmail = google.gmail({ version: "v1", auth: oauth2 });
  }

  async getUnreadEmails(limit = 20): Promise<GmailMessage[]> {
    if (!this.gmail) await this.authenticate();

    const list = await this.gmail.users.messages.list({
      userId: "me",
      q: "is:unread",
      maxResults: limit,
    });

    const ids: string[] = (list.data.messages ?? []).map((m: { id: string }) => m.id);
    const details = await Promise.all(
      ids.map((id: string) =>
        this.gmail.users.messages.get({ userId: "me", id, format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"] })
      )
    );

    return details.map((d: { data: GmailMessage }) => d.data);
  }

  private prompt(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
  }
}
