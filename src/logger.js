const chalk = require("chalk");

const ICONS = {
  orchestrator: "🎯",
  researcher:   "🔍",
  analyst:      "📊",
  writer:       "✍️ ",
  success:      "✅",
  error:        "❌",
  info:         "ℹ️ ",
};

function timestamp() {
  return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
}

function agentColor(role) {
  const colors = {
    orchestrator: chalk.magenta,
    researcher:   chalk.cyan,
    analyst:      chalk.yellow,
    writer:       chalk.green,
  };
  return colors[role] || chalk.white;
}

function logAgentStart(role, message) {
  const icon = ICONS[role] || "🤖";
  const color = agentColor(role);
  console.log(`\n${timestamp()} ${icon}  ${color.bold(`[${role.toUpperCase()}]`)} ${chalk.white(message)}`);
  console.log(chalk.gray("─".repeat(60)));
}

function logAgentDone(role, tokensUsed, durationMs) {
  const color = agentColor(role);
  console.log(chalk.gray("─".repeat(60)));
  console.log(`${timestamp()} ${ICONS.success} ${color(`[${role.toUpperCase()}]`)} ${chalk.gray(`Done — ${tokensUsed} tokens · ${durationMs}ms`)}`);
}

function logOutput(text) {
  const lines = text.split("\n").slice(0, 6);
  lines.forEach(line => console.log(chalk.white(`  ${line}`)));
  if (text.split("\n").length > 6) {
    console.log(chalk.gray(`  ... (${text.split("\n").length - 6} more lines)`));
  }
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
  console.log(`${chalk.bold("Total tokens used:")} ${chalk.yellow(totalTokens)}`);
  console.log(`${chalk.bold("Total time:       ")} ${chalk.yellow(totalMs + "ms")}`);
  console.log(chalk.green("━".repeat(60)) + "\n");
}

function logError(message, error) {
  console.error(`${timestamp()} ${ICONS.error} ${chalk.red.bold("ERROR:")} ${message}`);
  if (error?.message) console.error(chalk.red(`  ${error.message}`));
}

function logInfo(message) {
  console.log(`${timestamp()} ${ICONS.info}  ${chalk.blue(message)}`);
}

module.exports = { logAgentStart, logAgentDone, logOutput, logPipelineStart, logPipelineDone, logError, logInfo };
