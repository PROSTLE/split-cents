# split-cents

Split money across weights so the parts always add up to exactly the total.

Splitting $10.00 three ways with ordinary maths gives $3.33 three times, and a cent disappears. Rounding each part can create a cent from nowhere instead. `split-cents` works in whole minor units and gives every leftover cent a home.

```bash
npm install split-cents
```

```js
import { splitCents, splitEvenly, toCents, fromCents } from "split-cents";

splitCents(1000, [1, 1, 1]);     // [334, 333, 333]
splitCents(1000, [0.6, 0.4]);    // [600, 400]
splitEvenly(100, 3);             // [34, 33, 33]

toCents("4.35");                 // 435 (4.35 * 100 is 434.99999999999994 in JavaScript)
fromCents(435);                  // "4.35"
```

## How it splits

It uses the largest-remainder method. Each part is rounded down, then the leftover cents go to the parts that lost the most in rounding. Ties go to the earliest part, so the same input always gives the same result.

## API

| Function | What it does |
|---|---|
| `splitCents(total, weights)` | Splits whole minor units across relative weights. Weights don't need to add up to 1, and a weight of 0 gets nothing. |
| `splitEvenly(total, count)` | Splits into `count` parts that differ by at most one minor unit. |
| `toCents(amount, decimals = 2)` | Turns a decimal string into minor units without floating-point maths. |
| `fromCents(cents, decimals = 2)` | Turns minor units back into a decimal string. |

Use `decimals` for currencies with a different number of decimal places, such as `0` for JPY.

## It refuses to guess

These throw an error, because a quiet answer could lose or invent money:

- Splitting a non-zero total when every weight is 0
- A total that isn't a whole, non-negative number
- Negative or non-finite weights
- An amount with more decimal places than the currency has, such as `toCents("1.234")`

Amounts must fit in JavaScript's safe integer range. Negative amounts aren't supported.

## License

MIT
