/**
 * An invariant is something that must *always* be true: if it's ever false there's a bug in the code.
 * This helper function is used to assert that an invariant is true.
 * It also tells TypeScript that the condition is true, so you can use it to narrow types.
 * @example
 *   const something = [1, 2, 3];
 *   const item = something.find(x => x === 1);
 *   // type of item is number | undefined
 *   invariant(item !== undefined, "item must be defined");
 *   // type of item is number
 */
export default function invariant(cond: any, message: string): asserts cond {
  if (!cond) {
    throw new Error("Invariant violation: " + message);
  }
}
