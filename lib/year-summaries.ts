// Looks up the one-sentence summary of a year, the chat thread's answer to "What happened in {year}?" and the agent's report on it.
// The answers live in data/year-summaries.json beside the events, so they are edited with the data, not the code.
import yearSummaryData from '@/data/year-summaries.json';

const SUMMARIES = new Map(yearSummaryData.map(({ year, summary }) => [year, summary]));

export function yearSummary(year: number) {
  return SUMMARIES.get(year);
}
