import { AuthProviderCommon } from "@/lib/auth/providers";

export const LegacyAuthCommon: AuthProviderCommon = {
  makeSignInURL(redirectTo: string) {
    return `${
      process.env.NEXT_PUBLIC_SSO_URL
    }/login.php?return_url=${encodeURIComponent(redirectTo)}`;
  },
};
