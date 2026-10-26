// Looks up the one-sentence answer the chat thread gives to "What happened in {year}?".
// The answers live in data/year-summaries.json beside the events, so they are edited with the data, not the code.
import yearSummaryData from '@/data/year-summaries.json';

const SUMMARIES = new Map(yearSummaryData.map(({ year, summary }) => [year, summary]));

export function yearSummary(year: number) {
  return SUMMARIES.get(year);
}
