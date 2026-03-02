/**
 * Natural comparison for strings containing numbers.
 * "Title 2" sorts before "Title 10".
 */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
