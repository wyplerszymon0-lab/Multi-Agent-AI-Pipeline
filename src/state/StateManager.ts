import * as fs from "fs";
import * as path from "path";
import { AgentState } from "../types";

const STATE_FILE = path.join(process.cwd(), "data", "agent_state.json");

const DEFAULTS: AgentState = {
  watchedRepos: [],
  seenJobIds: [],
  jobKeywords: ["TypeScript", "Node.js", "React", "AI"],
  jobLocations: ["remote"],
};

export class StateManager {
  private state: AgentState;

  constructor() {
    this.state = this.load();
  }

  load(): AgentState {
    if (!fs.existsSync(STATE_FILE)) return { ...DEFAULTS };
    try {
      return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(STATE_FILE, "utf-8")) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  get<K extends keyof AgentState>(key: K): AgentState[K] {
    return this.state[key];
  }

  set<K extends keyof AgentState>(key: K, value: AgentState[K]): void {
    this.state[key] = value;
    this.persist();
  }

  private persist(): void {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), "utf-8");
  }
}
