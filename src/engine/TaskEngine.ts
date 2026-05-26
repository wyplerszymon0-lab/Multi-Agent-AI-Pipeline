import { CommandParser } from "./CommandParser";
import { TaskQueue } from "./TaskQueue";
import { GitHubAgent } from "../agents/GitHubAgent";
import { JobAgent } from "../agents/JobAgent";
import { EmailAgent } from "../agents/EmailAgent";
import { Orchestrator } from "../orchestrator";
import { AgentResult, Task } from "../types";

const logger = require("../logger");

export class TaskEngine {
  private parser = new CommandParser();
  private queue = new TaskQueue();
  private github = new GitHubAgent();
  private jobs = new JobAgent();
  private email = new EmailAgent();
  private pipeline = new Orchestrator();

  async execute(input: string): Promise<AgentResult> {
    const cmd = await this.parser.parse(input);
    const task = this.queue.create(cmd.type, input, cmd.params);

    logger.logAgentStart(
      "orchestrator",
      `"${input.slice(0, 60)}" → [${cmd.type}] (${Math.round(cmd.confidence * 100)}% confidence)`
    );
    this.queue.updateStatus(task.id, "running");

    try {
      const result = await this.route(cmd.type, cmd.params, input);
      this.queue.complete(task.id, result.output);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.queue.fail(task.id, msg);
      throw err;
    }
  }

  private async route(
    type: string,
    params: Record<string, unknown>,
    rawInput: string
  ): Promise<AgentResult> {
    switch (type) {
      case "check-github":
        return this.github.run(JSON.stringify(params));

      case "monitor-jobs":
        return this.jobs.run(JSON.stringify(params));

      case "read-emails":
        return this.email.run(JSON.stringify(params));

      case "research":
      case "analyze":
      case "write-report": {
        const topic = String(params.topic ?? rawInput);
        const ctx = await this.pipeline.run(topic);
        return {
          agentId: "orchestrator",
          role: "orchestrator",
          output: ctx.finalReport,
          tokensUsed: 0,
          durationMs: 0,
        };
      }

      default:
        return this.fallback(rawInput);
    }
  }

  private async fallback(input: string): Promise<AgentResult> {
    const { ResearcherAgent } = await import("../agents");
    const agent = new ResearcherAgent();
    return agent.run(input);
  }

  getHistory(): Task[] {
    return this.queue.getRecent(20);
  }
}
