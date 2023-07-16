import { LegacyAuthCommon } from "@/lib/auth/legacy/legacy-common";

export * from "./common";

const activeProvider = LegacyAuthCommon;

export function getSignInURL(returnURL: string): string {
  return activeProvider.makeSignInURL(returnURL);
}
