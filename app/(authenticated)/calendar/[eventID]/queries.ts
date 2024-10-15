import { QueryKey } from "@tanstack/react-query";

export function signUpSheetQueryKey(sheetID: number) {
  return ["calendar:signupSheet", { sheetID }] satisfies QueryKey;
}

export function sheetClashesQueryKey(sheetID: number) {
  return ["calendar:signupSheetClashes", { sheetID }] satisfies QueryKey;
}
