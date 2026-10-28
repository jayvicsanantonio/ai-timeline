// Unit tests for the IBM 029 keypunch (Hollerith) encoding the punch-card era draws its holes from.
// Covers letters, digits, punctuation, characters the code lacks and the card's 80-column limit.
import { describe, expect, it } from "vitest"
import { encodeHollerith, keypunchText, PUNCH_CARD_COLUMNS, PUNCH_CARD_ROWS } from "@/lib/hollerith"

describe("keypunchText", () => {
  it("turns text into the capitals and plain punctuation a keypunch could type, up to 80 columns", () => {
    expect(keypunchText("Gödel’s Proof — Re-checked")).toBe("GODEL'S PROOF - RE-CHECKED")
    expect(keypunchText("x".repeat(100))).toBe("X".repeat(80))
  })
})

describe("PUNCH_CARD_ROWS", () => {
  it("lists the twelve rows from the top of the card down", () => {
    expect(PUNCH_CARD_ROWS).toEqual(["12", "11", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])
  })
})

describe("encodeHollerith", () => {
  it("punches a single row for each digit", () => {
    expect(encodeHollerith("0159")).toEqual([["0"], ["1"], ["5"], ["9"]])
  })

  it("punches a zone row and a digit row for each letter", () => {
    expect(encodeHollerith("AIJRSZ")).toEqual([
      ["12", "1"],
      ["12", "9"],
      ["11", "1"],
      ["11", "9"],
      ["0", "2"],
      ["0", "9"],
    ])
  })

  it("encodes lowercase letters like uppercase ones, since the keypunch only types capitals", () => {
    expect(encodeHollerith("ai")).toEqual(encodeHollerith("AI"))
  })

  it("leaves a space unpunched", () => {
    expect(encodeHollerith("A B")).toEqual([["12", "1"], [], ["12", "2"]])
  })

  it("punches the 029 codes for punctuation, listing rows from the top down", () => {
    expect(encodeHollerith("&-/.,'():")).toEqual([
      ["12"],
      ["11"],
      ["0", "1"],
      ["12", "3", "8"],
      ["0", "3", "8"],
      ["5", "8"],
      ["12", "5", "8"],
      ["11", "5", "8"],
      ["2", "8"],
    ])
  })

  it("punches accented letters and typographic quotes and dashes as their plain forms", () => {
    expect(encodeHollerith("É’—")).toEqual(encodeHollerith("E'-"))
  })

  it("leaves a column blank for a character the code lacks", () => {
    expect(encodeHollerith("A~B")).toEqual([["12", "1"], [], ["12", "2"]])
  })

  it("stops at the card's 80 columns", () => {
    expect(PUNCH_CARD_COLUMNS).toBe(80)
    expect(encodeHollerith("X".repeat(100))).toHaveLength(80)
  })
})
