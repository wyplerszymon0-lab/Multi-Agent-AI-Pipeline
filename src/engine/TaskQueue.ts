import { Task, TaskStatus, TaskType } from "../types";

export class TaskQueue {
  private tasks: Map<string, Task> = new Map();

  create(type: TaskType, input: string, params: Record<string, unknown> = {}): Task {
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      input,
      params,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  updateStatus(id: string, status: TaskStatus): void {
    const t = this.tasks.get(id);
    if (t) t.status = status;
  }

  complete(id: string, output: string): void {
    const t = this.tasks.get(id);
    if (!t) return;
    t.status = "done";
    t.output = output;
    t.completedAt = new Date().toISOString();
  }

  fail(id: string, error: string): void {
    const t = this.tasks.get(id);
    if (!t) return;
    t.status = "failed";
    t.error = error;
    t.completedAt = new Date().toISOString();
  }

  getRecent(limit = 20): Task[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}
