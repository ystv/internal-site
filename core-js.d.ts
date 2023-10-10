declare module "core-js-pure/stable/array/find-last" {
  function findLast<T>(
    array: T[],
    predicate: (value: T) => boolean,
  ): T | undefined;
  export = findLast;
}
