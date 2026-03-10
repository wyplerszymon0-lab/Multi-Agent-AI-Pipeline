import OpenAI from "openai";
import { AgentConfig, AgentResult, Message } from "./types";

export class Agent {
  protected client: OpenAI;
  protected config: AgentConfig;
  protected history: Message[] = [];

  constructor(config: AgentConfig) {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.config = config;
    this.history = [{ role: "system", content: config.systemPrompt }];
  }

  async run(userMessage: string): Promise<AgentResult> {
    const start = Date.now();
    this.history.push({ role: "user", content: userMessage });

    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: this.history,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    const output = response.choices[0]?.message?.content ?? "";
    const tokensUsed = response.usage?.total_tokens ?? 0;

    this.history.push({ role: "assistant", content: output });

    return {
      agentId: this.config.id,
      role: this.config.role,
      output,
      tokensUsed,
      durationMs: Date.now() - start,
    };
  }

  reset(): void {
    this.history = [{ role: "system", content: this.config.systemPrompt }];
  }

  getId(): string {
    return this.config.id;
  }

  getRole(): string {
    return this.config.role;
  }
}
