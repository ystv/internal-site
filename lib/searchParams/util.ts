export function getSearchParamsString(paramsObject: Object) {
  return Object.entries(paramsObject)
    .filter(([key, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}
