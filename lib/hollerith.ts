// Encodes text in the IBM 029 keypunch (Hollerith) code, the hole pattern of an 80-column punch card.
// Each character becomes the rows punched in its column; characters the code lacks leave the column blank.
export const PUNCH_CARD_ROWS = ['12', '11', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export type PunchRow = (typeof PUNCH_CARD_ROWS)[number];

export const PUNCH_CARD_COLUMNS = 80;

const DIGIT_ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

// Punctuation in the 029 code, each listed with its rows from the top of the card down
const PUNCTUATION: Record<string, PunchRow[]> = {
  '&': ['12'],
  '-': ['11'],
  '/': ['0', '1'],
  '.': ['12', '3', '8'],
  '<': ['12', '4', '8'],
  '(': ['12', '5', '8'],
  '+': ['12', '6', '8'],
  '|': ['12', '7', '8'],
  '!': ['11', '2', '8'],
  $: ['11', '3', '8'],
  '*': ['11', '4', '8'],
  ')': ['11', '5', '8'],
  ';': ['11', '6', '8'],
  ',': ['0', '3', '8'],
  '%': ['0', '4', '8'],
  _: ['0', '5', '8'],
  '>': ['0', '6', '8'],
  '?': ['0', '7', '8'],
  ':': ['2', '8'],
  '#': ['3', '8'],
  '@': ['4', '8'],
  "'": ['5', '8'],
  '=': ['6', '8'],
  '"': ['7', '8'],
};

// Typographic characters the keypunch could not type, mapped to the plain ones it could
const PLAIN_FORMS: Record<string, string> = {
  '‘': "'",
  '’': "'",
  '“': '"',
  '”': '"',
  '–': '-',
  '—': '-',
};

function encodeCharacter(character: string): PunchRow[] {
  if (/[0-9]/.test(character)) {
    return [character as PunchRow];
  }

  const letterIndex = character.charCodeAt(0) - 'A'.charCodeAt(0);
  if (/[A-I]/.test(character)) {
    return ['12', DIGIT_ROWS[letterIndex]];
  }
  if (/[J-R]/.test(character)) {
    return ['11', DIGIT_ROWS[letterIndex - 9]];
  }
  if (/[S-Z]/.test(character)) {
    // S starts on row 2, because 0-1 is the slash
    return ['0', DIGIT_ROWS[letterIndex - 17]];
  }

  return PUNCTUATION[character] ?? [];
}

// The text as a keypunch would have typed it: capitals, plain punctuation and at most one card of columns
export function keypunchText(text: string) {
  const plainText = Array.from(text, (character) => PLAIN_FORMS[character] ?? character)
    .join('')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();

  return Array.from(plainText).slice(0, PUNCH_CARD_COLUMNS).join('');
}

export function encodeHollerith(text: string): PunchRow[][] {
  return Array.from(keypunchText(text)).map(encodeCharacter);
}
