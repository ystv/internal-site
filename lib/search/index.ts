/**
 * Turns a plain string into a basic tsquery string to be used in postgres
 * https://www.postgresql.org/docs/current/datatype-textsearch.html#DATATYPE-TSQUERY
 */
export function getTsQuery(query: string): string {
  const trimmedQuery = query.trim();

  const searchRegex = /[^0-9a-z\ \@]/gi;

  const cleanQuery = trimmedQuery.replaceAll(searchRegex, "");

  const wildcardQuery = `${cleanQuery.replaceAll(/\s+/gi, ":* & ")}:*`;

  return wildcardQuery;
}
