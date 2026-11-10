// The page's two themes: the classic timeline, every era in the computer interface of its day, and the Pokémon theme, the
// same history as an adventure through nine evolution lines. The classic theme is the default. The reader's choice is
// kept in their browser, and a link can ask for a theme with ?theme=pokemon or ?theme=classic.
export type TimelineTheme = 'classic' | 'pokemon';

export const DEFAULT_THEME: TimelineTheme = 'classic';

export const THEME_STORAGE_KEY = 'ai-timeline-theme';

// The attribute on <html> that says the Pokémon theme is on, set before the first paint so the classic page never flashes
export const THEME_ATTRIBUTE = 'data-timeline-theme';

export function isTimelineTheme(value: unknown): value is TimelineTheme {
  return value === 'classic' || value === 'pokemon';
}

// The theme a link asks for, or else the one the reader last picked, or else the default
export function preferredTheme(search: string, stored: string | null): TimelineTheme {
  const asked = new URLSearchParams(search).get('theme');
  if (isTimelineTheme(asked)) {
    return asked;
  }
  return isTimelineTheme(stored) ? stored : DEFAULT_THEME;
}

// Runs inline in <head> before the page paints: marks <html> with the preferred theme. Storage can be blocked, so every
// read is guarded.
export const THEME_BOOT_SCRIPT = `(function(){try{var s=null;try{s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}var a=new URLSearchParams(location.search).get('theme');var t=a==='pokemon'||a==='classic'?a:s==='pokemon'?'pokemon':'classic';document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},t)}catch(e){}})()`;
