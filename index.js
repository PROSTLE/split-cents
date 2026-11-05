/**
 * Split an amount of money across weights so the parts always add up to exactly the total.
 * Works in whole minor units (cents), using the largest-remainder method: each part is rounded
 * down, then leftover cents go to the parts that lost the most. Ties go to the earliest part,
 * so the same input always gives the same result.
 *
 * @param {number} total Whole minor units to split, for example 1000 for $10.00.
 * @param {number[]} weights Relative shares. They don't need to add up to 1. Zero is allowed.
 * @returns {number[]} Whole minor units per weight, in the same order, summing to `total`.
 */
export function splitCents(total, weights) {
  if (!Number.isSafeInteger(total) || total < 0) throw new RangeError("total must be a non-negative whole number of minor units");
  if (!Array.isArray(weights) || weights.length === 0) throw new TypeError("weights must be a non-empty array");
  for (const w of weights) {
    if (typeof w !== "number" || !Number.isFinite(w) || w < 0) throw new RangeError("every weight must be a finite number of 0 or more");
  }
  const sum = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return weights.map(() => 0);
  // Returning zeros here would silently lose the money, so it's an error.
  if (sum === 0) throw new RangeError("at least one weight must be more than 0");

  const raw = weights.map((w) => (total * w) / sum);
  const parts = raw.map(Math.floor);
  let left = total - parts.reduce((a, b) => a + b, 0);
  const byRemainder = raw
    .map((r, i) => ({ i, remainder: r - Math.floor(r) }))
    .sort((a, b) => b.remainder - a.remainder || a.i - b.i);
  // Floating-point rounding can leave `left` above the part count or below zero, so it loops until exact.
  while (left > 0) {
    for (const { i } of byRemainder) {
      if (left === 0) break;
      if (weights[i] === 0) continue;
      parts[i] += 1;
      left -= 1;
    }
  }
  while (left < 0) {
    for (const { i } of [...byRemainder].reverse()) {
      if (left === 0) break;
      if (parts[i] === 0) continue;
      parts[i] -= 1;
      left += 1;
    }
  }
  return parts;
}

/**
 * Split an amount into `count` parts that differ by at most one minor unit.
 *
 * @param {number} total Whole minor units to split.
 * @param {number} count How many parts, at least 1.
 * @returns {number[]}
 */
export function splitEvenly(total, count) {
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError("count must be a whole number of 1 or more");
  return splitCents(total, new Array(count).fill(1));
}

/**
 * Turn a decimal string into whole minor units without floating-point maths.
 * Rejects anything with more decimal places than the currency has, rather than rounding money silently.
 *
 * @param {string} amount For example "19.99".
 * @param {number} [decimals=2] Decimal places in the currency: 2 for USD, 0 for JPY.
 * @returns {number}
 */
export function toCents(amount, decimals = 2) {
  if (typeof amount !== "string" || !/^\d+(\.\d+)?$/.test(amount.trim())) throw new TypeError('amount must be a decimal string like "19.99"');
  const [whole, fraction = ""] = amount.trim().split(".");
  if (fraction.replace(/0+$/, "").length > decimals) throw new RangeError(`amount has more than ${decimals} decimal places`);
  const value = Number(whole + fraction.slice(0, decimals).padEnd(decimals, "0"));
  if (!Number.isSafeInteger(value)) throw new RangeError("amount is too large to represent exactly");
  return value;
}

/**
 * Turn whole minor units back into a decimal string.
 *
 * @param {number} cents For example 1999.
 * @param {number} [decimals=2] Decimal places in the currency.
 * @returns {string} For example "19.99".
 */
export function fromCents(cents, decimals = 2) {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new RangeError("cents must be a non-negative whole number");
  if (decimals === 0) return String(cents);
  const digits = String(cents).padStart(decimals + 1, "0");
  return `${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`;
}
