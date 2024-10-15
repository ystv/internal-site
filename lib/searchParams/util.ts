export function getSearchParamsString(paramsObject: Object) {
  return Object.entries(paramsObject)
    .filter(([_key, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
}
