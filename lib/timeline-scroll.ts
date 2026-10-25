// Moves the reader around the timeline: to an era's title, to a year's first event, or one event forward or back.
// Each move also moves keyboard focus to where the reader lands, so assistive technology follows along.

// How far down the viewport, as a share of its height, the reader's eye rests. The era or
// event whose top has passed this line is the one being read. It sits at the middle, because
// stepping to an event or a year centers that event on screen.
export const READING_LINE = 0.5;

export function readingLineY() {
  return window.innerHeight * READING_LINE;
}

// The index of the last element whose top has passed the y position, or -1 when none has.
// The elements must be in page order, so their tops never decrease.
export function lastIndexAbove(elements: ArrayLike<Element>, y: number) {
  let low = 0;
  let high = elements.length - 1;
  let found = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (elements[middle].getBoundingClientRect().top <= y) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return found;
}

// Glides, unless the reader prefers reduced motion, where the page's CSS also turns smooth scrolling off
function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function eventLinks() {
  return Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-event-link]'));
}

function cardOf(link: HTMLElement) {
  return link.closest('article') ?? link;
}

function focusEvent(link: HTMLAnchorElement) {
  link.focus({ preventScroll: true });
  cardOf(link).scrollIntoView({ block: 'center', behavior: scrollBehavior() });
}

// Steps from the focused event, or else from the event at the reading line
export function stepEvent(direction: 1 | -1) {
  const links = eventLinks();
  if (links.length === 0) {
    return;
  }

  let index = links.indexOf(document.activeElement as HTMLAnchorElement);
  if (index === -1) {
    index = lastIndexAbove(links.map(cardOf), readingLineY());
  }

  const target = Math.min(Math.max(index + direction, 0), links.length - 1);
  focusEvent(links[target]);
}

export function scrollToEra(eraId: string) {
  const section = document.getElementById(eraId);
  if (!section) {
    return;
  }

  section.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  section.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
}

export function scrollToYear(year: number) {
  const link = document.querySelector<HTMLAnchorElement>(
    `article[data-year="${year}"] a[data-event-link]`
  );
  if (link) {
    focusEvent(link);
  }
}
