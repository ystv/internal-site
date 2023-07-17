export interface AuthProviderServer {
  getCurrentUserIDFromHeaders(): Promise<number | null>;
  getCurrentUserIDFromRequest(req: Request): Promise<number | null>;
}

export interface AuthProviderCommon {
  makeSignInURL(redirectTo: string): string;
}
