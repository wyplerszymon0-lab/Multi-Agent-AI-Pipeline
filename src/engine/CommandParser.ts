import OpenAI from "openai";
import { ParsedCommand, TaskType } from "../types";

type PatternRule = {
  regex: RegExp;
  type: TaskType;
  extract: (m: RegExpMatchArray) => Record<string, unknown>;
};

const RULES: PatternRule[] = [
  {
    regex: /^(research|analyze|write[\s-]?report)\s+(.+)/i,
    type: "research",
    extract: m => ({ topic: m[2].trim() }),
  },
  {
    regex: /^check\s+github\s*(.*)/i,
    type: "check-github",
    extract: m => {
      const repos = m[1].trim().split(/\s+/).filter(r => r.includes("/"));
      return repos.length ? { repos } : {};
    },
  },
  {
    regex: /^(monitor|check|find|search)\s+jobs?\s*(.*)/i,
    type: "monitor-jobs",
    extract: m => {
      const keywords = m[2].trim().split(/\s+/).filter(Boolean);
      return keywords.length ? { keywords } : {};
    },
  },
  {
    regex: /^(read|check|show|get)\s+(my\s+)?emails?\s*(.*)/i,
    type: "read-emails",
    extract: m => {
      const rest = m[3].trim();
      const limitMatch = rest.match(/\blimit\s+(\d+)/i);
      return limitMatch ? { limit: parseInt(limitMatch[1], 10) } : {};
    },
  },
];

export class CommandParser {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async parse(input: string): Promise<ParsedCommand> {
    for (const rule of RULES) {
      const m = input.match(rule.regex);
      if (m) {
        return { type: rule.type, params: rule.extract(m), rawInput: input, confidence: 0.95 };
      }
    }
    return this.parseWithLLM(input);
  }

  private async parseWithLLM(input: string): Promise<ParsedCommand> {
    const res = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Parse user input into a JSON command. Return:
{"type":"<type>","params":{...},"confidence":<0-1>}
Valid types: research | check-github | monitor-jobs | read-emails | unknown
Params for check-github: {repos?:string[]}
Params for monitor-jobs: {keywords?:string[], remote?:boolean}
Params for read-emails: {limit?:number, unreadOnly?:boolean}
Params for research: {topic:string}`,
        },
        { role: "user", content: input },
      ],
    });

    try {
      const parsed = JSON.parse(res.choices[0]?.message?.content ?? "{}");
      return {
        type: (parsed.type as TaskType) ?? "unknown",
        params: parsed.params ?? {},
        rawInput: input,
        confidence: parsed.confidence ?? 0.5,
      };
    } catch {
      return { type: "unknown", params: {}, rawInput: input, confidence: 0 };
    }
  }
}
