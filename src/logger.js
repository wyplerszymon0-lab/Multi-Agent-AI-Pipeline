const chalk = require("chalk");

const ICONS = {
  orchestrator:    "🎯",
  researcher:      "🔍",
  analyst:         "📊",
  writer:          "✍️ ",
  "github-monitor": "🐙",
  "job-monitor":   "💼",
  "email-reader":  "📧",
  "task-router":   "🔀",
  success:         "✅",
  error:           "❌",
  info:            "ℹ️ ",
};

const COLORS = {
  orchestrator:    chalk.magenta,
  researcher:      chalk.cyan,
  analyst:         chalk.yellow,
  writer:          chalk.green,
  "github-monitor": chalk.blue,
  "job-monitor":   chalk.hex("#FFA500"),
  "email-reader":  chalk.hex("#FF69B4"),
  "task-router":   chalk.white,
};

function ts() {
  return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
}

function color(role) {
  return COLORS[role] || chalk.white;
}

function logAgentStart(role, message) {
  const icon = ICONS[role] || "🤖";
  const c = color(role);
  console.log(`\n${ts()} ${icon}  ${c.bold(`[${role.toUpperCase()}]`)} ${chalk.white(message)}`);
  console.log(chalk.gray("─".repeat(60)));
}

function logAgentDone(role, tokensUsed, durationMs) {
  const c = color(role);
  console.log(chalk.gray("─".repeat(60)));
  console.log(`${ts()} ${ICONS.success} ${c(`[${role.toUpperCase()}]`)} ${chalk.gray(`Done — ${tokensUsed} tokens · ${durationMs}ms`)}`);
}

function logOutput(text) {
  const lines = text.split("\n").slice(0, 6);
  lines.forEach(l => console.log(chalk.white(`  ${l}`)));
  const total = text.split("\n").length;
  if (total > 6) console.log(chalk.gray(`  ... (${total - 6} more lines)`));
}

function logPipelineStart(topic) {
  console.log("\n" + chalk.bgMagenta.white.bold("  ⚡ MULTI-AGENT PIPELINE  "));
  console.log(chalk.magenta("━".repeat(60)));
  console.log(`${chalk.bold("Topic:")} ${chalk.cyan(topic)}`);
  console.log(chalk.magenta("━".repeat(60)));
}

function logPipelineDone(totalTokens, totalMs) {
  console.log("\n" + chalk.bgGreen.white.bold("  ✅ PIPELINE COMPLETE  "));
  console.log(chalk.green("━".repeat(60)));
  console.log(`${chalk.bold("Total tokens:")} ${chalk.yellow(totalTokens)}`);
  console.log(`${chalk.bold("Total time:  ")} ${chalk.yellow(totalMs + "ms")}`);
  console.log(chalk.green("━".repeat(60)) + "\n");
}

function logError(message, error) {
  console.error(`${ts()} ${ICONS.error} ${chalk.red.bold("ERROR:")} ${message}`);
  if (error?.message) console.error(chalk.red(`  ${error.message}`));
}

function logInfo(message) {
  console.log(`${ts()} ${ICONS.info}  ${chalk.blue(message)}`);
}

function colorize(colorName, text) {
  const fn = chalk[colorName] || chalk.white;
  return fn(text);
}

module.exports = {
  logAgentStart, logAgentDone, logOutput,
  logPipelineStart, logPipelineDone,
  logError, logInfo, colorize,
};
