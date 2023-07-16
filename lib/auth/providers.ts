export interface AuthProviderServer {
  getCurrentUserID(): Promise<number | null>;
}

export interface AuthProviderCommon {
  makeSignInURL(redirectTo: string): string;
}
