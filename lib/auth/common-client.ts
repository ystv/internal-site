export function getSignInURL(returnURL: string): string {
  return `${
    process.env.NEXT_PUBLIC_SSO_URL
  }/login.php?return_url=${encodeURIComponent(returnURL)}`;
}
