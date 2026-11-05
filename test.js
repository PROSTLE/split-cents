import { test } from "node:test";
import assert from "node:assert/strict";
import { fromCents, splitCents, splitEvenly, toCents } from "./index.js";

const sum = (a) => a.reduce((x, y) => x + y, 0);

test("splits by weight and hands leftover cents to the largest remainders", () => {
  assert.deepEqual(splitCents(1000, [1, 1, 1]), [334, 333, 333]);
  assert.deepEqual(splitCents(100, [0.6, 0.4]), [60, 40]);
  assert.deepEqual(splitCents(101, [2, 1]), [67, 34]);
  assert.deepEqual(splitCents(10, [3, 3, 4]), [3, 3, 4]);
});

test("weights don't have to add up to 1, and a zero weight gets nothing", () => {
  assert.deepEqual(splitCents(500, [3, 2]), splitCents(500, [0.6, 0.4]));
  assert.deepEqual(splitCents(100, [0, 1, 1]), [0, 50, 50]);
  assert.deepEqual(splitCents(1, [0, 0, 5]), [0, 0, 1]);
});

test("the same input always gives the same result", () => {
  assert.deepEqual(splitCents(7, [1, 1, 1, 1]), [2, 2, 2, 1]);
  assert.deepEqual(splitCents(7, [1, 1, 1, 1]), [2, 2, 2, 1]);
});

test("the parts always add up to the exact total", () => {
  // A fixed-seed generator, so a failure here can be reproduced.
  let seed = 42;
  const next = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let run = 0; run < 20000; run++) {
    const total = Math.floor(next() * 10 ** Math.floor(next() * 12));
    const weights = Array.from({ length: 1 + Math.floor(next() * 12) }, () => (next() < 0.1 ? 0 : next() * 10 ** Math.floor(next() * 6)));
    if (sum(weights) === 0) continue;
    const parts = splitCents(total, weights);
    assert.equal(sum(parts), total, `total ${total}, weights ${weights}`);
    weights.forEach((w, i) => {
      assert.ok(Number.isInteger(parts[i]) && parts[i] >= 0, "whole and never negative");
      if (w === 0) assert.equal(parts[i], 0, "a zero weight gets nothing");
    });
  }
});

test("refuses input that would lose or invent money", () => {
  assert.throws(() => splitCents(100, [0, 0]), /more than 0/);
  assert.throws(() => splitCents(10.5, [1]), /whole number/);
  assert.throws(() => splitCents(-1, [1]), /non-negative/);
  assert.throws(() => splitCents(100, []), /non-empty/);
  assert.throws(() => splitCents(100, [1, -1]), /0 or more/);
  assert.throws(() => splitCents(100, [NaN]), /finite/);
  assert.deepEqual(splitCents(0, [0, 0]), [0, 0], "nothing to split is fine");
});

test("splitEvenly keeps parts within one cent", () => {
  assert.deepEqual(splitEvenly(100, 3), [34, 33, 33]);
  assert.deepEqual(splitEvenly(2, 4), [1, 1, 0, 0]);
  assert.throws(() => splitEvenly(100, 0), /1 or more/);
});

test("converts decimal strings without floating-point errors", () => {
  assert.equal(toCents("19.99"), 1999);
  assert.equal(toCents("1.1"), 110);
  assert.equal(toCents("0.07"), 7);
  assert.equal(toCents("4.35"), 435, "4.35 * 100 is 434.99999999999994 in floating point");
  assert.equal(toCents("1000", 0), 1000);
  assert.equal(toCents("1.500"), 150, "extra zeros are harmless");
  assert.throws(() => toCents("1.234"), /more than 2 decimal places/);
  assert.throws(() => toCents("abc"), /decimal string/);
  assert.throws(() => toCents("-1"), /decimal string/);
  assert.throws(() => toCents("99999999999999999999"), /too large/);
});

test("converts back to a decimal string", () => {
  assert.equal(fromCents(1999), "19.99");
  assert.equal(fromCents(7), "0.07");
  assert.equal(fromCents(0), "0.00");
  assert.equal(fromCents(1000, 0), "1000");
  assert.equal(fromCents(1234, 3), "1.234");
  assert.equal(fromCents(toCents("4.35")), "4.35");
});
