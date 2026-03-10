import { ResearcherAgent, AnalystAgent, WriterAgent } from "./agents";
import { AgentResult, PipelineContext } from "./types";

const logger = require("./logger");

export class Orchestrator {
  private researcher: ResearcherAgent;
  private analyst: AnalystAgent;
  private writer: WriterAgent;
  private results: AgentResult[] = [];

  constructor() {
    this.researcher = new ResearcherAgent();
    this.analyst    = new AnalystAgent();
    this.writer     = new WriterAgent();
  }

  async run(topic: string): Promise<PipelineContext> {
    const pipelineStart = Date.now();
    logger.logPipelineStart(topic);

    const ctx: PipelineContext = {
      topic,
      researchOutput: "",
      analysisOutput: "",
      writerOutput:   "",
      finalReport:    "",
    };

    logger.logAgentStart("researcher", `Researching: "${topic}"`);
    const researchResult = await this.researcher.run(
      `Please research the following topic in depth: "${topic}". Provide comprehensive findings.`
    );
    ctx.researchOutput = researchResult.output;
    this.results.push(researchResult);
    logger.logAgentDone("researcher", researchResult.tokensUsed, researchResult.durationMs);
    logger.logOutput(researchResult.output);

    logger.logAgentStart("analyst", "Analyzing research findings...");
    const analysisResult = await this.analyst.run(
      `Here are the research findings on "${topic}":\n\n${ctx.researchOutput}\n\nPlease analyze these findings, identify key insights, patterns and provide your expert analysis.`
    );
    ctx.analysisOutput = analysisResult.output;
    this.results.push(analysisResult);
    logger.logAgentDone("analyst", analysisResult.tokensUsed, analysisResult.durationMs);
    logger.logOutput(analysisResult.output);

    logger.logAgentStart("writer", "Writing final report...");
    const writerResult = await this.writer.run(
      `Using the research and analysis below, write a comprehensive, engaging report on "${topic}".\n\n` +
      `RESEARCH:\n${ctx.researchOutput}\n\n` +
      `ANALYSIS:\n${ctx.analysisOutput}\n\n` +
      `Create a polished, publication-ready report.`
    );
    ctx.writerOutput = writerResult.output;
    ctx.finalReport  = writerResult.output;
    this.results.push(writerResult);
    logger.logAgentDone("writer", writerResult.tokensUsed, writerResult.durationMs);

    const totalTokens = this.results.reduce((s, r) => s + r.tokensUsed, 0);
    const totalMs     = Date.now() - pipelineStart;
    logger.logPipelineDone(totalTokens, totalMs);

    return ctx;
  }

  getResults(): AgentResult[] {
    return this.results;
  }
}
