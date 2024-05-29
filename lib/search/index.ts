export function getTsQuery(query: string): string {
  const trimmedQuery = query.trim();

  const searchRegex = /[^0-9a-z\ \@]/gi;

  const cleanQuery = trimmedQuery.replaceAll(searchRegex, "");

  const wildcardQuery = `${cleanQuery.replaceAll(/\s+/gi, ":* & ")}:*`;

  return wildcardQuery;
}
