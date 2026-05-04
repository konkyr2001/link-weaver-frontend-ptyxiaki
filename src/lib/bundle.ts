const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface BundleLink {
  id: string;
  url: string;
  title?: string;
  favicon?: string;
  ogImage?: string;
}

export interface Bundle {
  title: string;
  links: BundleLink[];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export async function createBundle(bundle: Bundle, userToken: string, captcha: string): Promise<string | null> {
  try {
    const res = await fetch (`${BACKEND_URL}/api/project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectName: bundle.title,
        urls: bundle.links,
        userToken,
        captcha
      })
    });
    if (res.ok) {
      const result = await res.json();
      return `${window.location.origin}/b/${result.slug}`;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchBundleBySlug(param: string): Promise<Bundle | null> {
  try {
    const res = await fetch (`${BACKEND_URL}/api/project/${param}`);
    if (res.ok) {
      const result = await res.json();
      return {
        title: result.projectName,
        links: result.urls
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname;
  } catch {
    return url;
  }
}

export function getFaviconUrl(url: string): string {
  const domain = extractDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

export function getOgImageUrl(url: string): string {
  // Use a free OG image proxy
  const encoded = encodeURIComponent(url.startsWith('http') ? url : `https://${url}`);
  return `https://api.microlink.io/?url=${encoded}&screenshot=true&meta=false&embed=screenshot.url`;
}

export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}
