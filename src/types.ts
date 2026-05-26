export type AgentRole =
  | "orchestrator"
  | "researcher"
  | "analyst"
  | "writer"
  | "github-monitor"
  | "job-monitor"
  | "email-reader"
  | "task-router";

export type AgentStatus = "idle" | "running" | "done" | "error";

export type TaskStatus = "pending" | "running" | "done" | "failed";

export type TaskType =
  | "research"
  | "analyze"
  | "write-report"
  | "check-github"
  | "monitor-jobs"
  | "read-emails"
  | "unknown";

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

export interface Task {
  id: string;
  type: TaskType;
  input: string;
  params: Record<string, unknown>;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  output?: string;
  error?: string;
}

export interface ParsedCommand {
  type: TaskType;
  params: Record<string, unknown>;
  rawInput: string;
  confidence: number;
}

export interface GitHubEvent {
  type: string;
  title: string;
  url: string;
  author: string;
  createdAt: string;
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  tags: string[];
  salary?: string;
  postedAt: string;
  source: string;
}

export interface AgentState {
  watchedRepos: string[];
  seenJobIds: string[];
  jobKeywords: string[];
  jobLocations: string[];
  lastGithubCheck?: string;
  lastEmailCheck?: string;
}
