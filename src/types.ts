export type AgentRole = "orchestrator" | "researcher" | "analyst" | "writer";

export type AgentStatus = "idle" | "running" | "done" | "error";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AgentResult {
  agentId: string;
  role: AgentRole;
  output: string;
  tokensUsed: number;
  durationMs: number;
}

export interface PipelineContext {
  topic: string;
  researchOutput: string;
  analysisOutput: string;
  writerOutput: string;
  finalReport: string;
}

export interface AgentConfig {
  id: string;
  role: AgentRole;
  systemPrompt: string;
  model: string;
  maxTokens: number;
  temperature: number;
}
