// Only allow same-site relative paths as redirect targets, to avoid open
// redirects via a crafted callbackUrl (e.g. "//evil.com" or "https://evil.com").
export function isSafeRedirect(url: string | undefined | null): url is string {
  return Boolean(url) && url!.startsWith("/") && !url!.startsWith("//");
}
