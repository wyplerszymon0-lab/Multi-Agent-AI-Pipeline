import * as dotenv from "dotenv";
import * as readline from "readline";
import { TaskEngine } from "./engine/TaskEngine";
import { StateManager } from "./state/StateManager";

dotenv.config();

const logger = require("./logger");

const BANNER = `
╔══════════════════════════════════════════════════════════════╗
║         PERSONAL AUTONOMOUS AGENT  v2.0                      ║
║  GitHub Monitor · Job Tracker · Email Reader · Task Engine   ║
╚══════════════════════════════════════════════════════════════╝`;

const HELP = `
Commands:
  research <topic>                 Run full research pipeline
  check github [owner/repo ...]    Check watched GitHub repos
  watch github <owner/repo>        Add a repo to the watch list
  unwatch github <owner/repo>      Remove a repo from the watch list
  monitor jobs [keyword ...]       Scan for new job offers
  set job keywords <k1> <k2> ...   Update job search keywords
  read emails [limit <n>]          Read and categorize unread emails
  status                           Show current agent state
  history                          Show recent task history
  help                             Show this message
  exit                             Quit
`;

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    logger.logError("OPENAI_API_KEY is not set. Create a .env file.");
    process.exit(1);
  }

  const engine = new TaskEngine();
  const state = new StateManager();

  // Non-interactive: pass command as CLI args
  const args = process.argv.slice(2);
  if (args.length > 0) {
    try {
      const result = await engine.execute(args.join(" "));
      console.log("\n" + result.output);
    } catch (err: unknown) {
      logger.logError("Task failed", err instanceof Error ? err : new Error(String(err)));
      process.exit(1);
    }
    return;
  }

  // Interactive REPL
  console.log(BANNER);
  logger.logInfo("Agent ready. Type 'help' for commands.\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "\x1b[35m❯\x1b[0m ",
  });

  rl.prompt();

  rl.on("line", async (raw: string) => {
    const input = raw.trim();
    if (!input) { rl.prompt(); return; }

    // Built-in commands that don't go through the engine
    if (input === "exit" || input === "quit") {
      logger.logInfo("Goodbye.");
      process.exit(0);
    }

    if (input === "help") {
      console.log(HELP);
      rl.prompt();
      return;
    }

    if (input === "status") {
      const s = state.load();
      console.log("\n" + JSON.stringify(s, null, 2) + "\n");
      rl.prompt();
      return;
    }

    if (input === "history") {
      const tasks = engine.getHistory();
      if (!tasks.length) { console.log("  No tasks yet.\n"); rl.prompt(); return; }
      tasks.forEach(t => {
        const icon = t.status === "done" ? "✅" : t.status === "failed" ? "❌" : "⏳";
        console.log(`  ${icon} [${t.type}] ${t.input.slice(0, 55).padEnd(55)} ${t.status}`);
      });
      console.log();
      rl.prompt();
      return;
    }

    if (input.startsWith("watch github ")) {
      const repo = input.slice("watch github ".length).trim();
      if (!repo.includes("/")) {
        console.log("  Format: watch github <owner>/<repo>\n");
      } else {
        const repos = state.get("watchedRepos") as string[];
        if (!repos.includes(repo)) {
          state.set("watchedRepos", [...repos, repo]);
          logger.logInfo(`Watching: ${repo}`);
        } else {
          logger.logInfo(`Already watching: ${repo}`);
        }
      }
      rl.prompt();
      return;
    }

    if (input.startsWith("unwatch github ")) {
      const repo = input.slice("unwatch github ".length).trim();
      const repos = (state.get("watchedRepos") as string[]).filter(r => r !== repo);
      state.set("watchedRepos", repos);
      logger.logInfo(`Removed: ${repo}`);
      rl.prompt();
      return;
    }

    if (input.startsWith("set job keywords ")) {
      const keywords = input.slice("set job keywords ".length).trim().split(/\s+/);
      state.set("jobKeywords", keywords);
      logger.logInfo(`Job keywords: ${keywords.join(", ")}`);
      rl.prompt();
      return;
    }

    // Route through the engine
    try {
      const result = await engine.execute(input);
      console.log("\n" + result.output + "\n");
    } catch (err: unknown) {
      logger.logError("Task failed", err instanceof Error ? err : new Error(String(err)));
    }

    rl.prompt();
  });

  rl.on("close", () => process.exit(0));
}

main();
