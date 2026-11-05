/** Split whole minor units across weights. The parts always add up to exactly `total`. */
export function splitCents(total: number, weights: readonly number[]): number[];
/** Split whole minor units into `count` parts that differ by at most one. */
export function splitEvenly(total: number, count: number): number[];
/** Turn a decimal string such as "19.99" into whole minor units, without floating-point maths. */
export function toCents(amount: string, decimals?: number): number;
/** Turn whole minor units back into a decimal string. */
export function fromCents(cents: number, decimals?: number): string;
