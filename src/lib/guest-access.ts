const PUBLIC_GUEST_EXACT_PATHS = ['/', '/api'] as const;

const PUBLIC_GUEST_PATH_PREFIXES = [
  '/douban',
  '/live',
  '/play',
  '/release-calendar',
  '/search',
  '/shortdrama',
  '/source-browser',
  '/api/acg',
  '/api/ad-filter',
  '/api/bilibili/popular',
  '/api/bilibili/search',
  '/api/bing-wallpaper',
  '/api/cache',
  '/api/client-log',
  '/api/crash-report',
  '/api/danmu-external',
  '/api/detail',
  '/api/douban',
  '/api/image-proxy',
  '/api/live',
  '/api/netdisk/search',
  '/api/parse',
  '/api/proxy',
  '/api/proxy-status',
  '/api/release-calendar',
  '/api/search',
  '/api/shortdrama',
  '/api/source-browser',
  '/api/source-weights',
  '/api/sources',
  '/api/tmdb',
  '/api/video-proxy',
  '/api/youtube',
] as const;

function matchesPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Guest mode is enabled by default for this fork. Set
 * ENABLE_GUEST_MODE=false to restore the original login wall.
 */
export function isGuestModeEnabled(): boolean {
  return process.env.ENABLE_GUEST_MODE !== 'false';
}

/**
 * Only explicitly listed browsing and playback routes are public. Everything
 * else, including account data and administration routes, stays protected.
 */
export function canAccessAsGuest(pathname: string): boolean {
  if (!isGuestModeEnabled()) return false;
  if ((PUBLIC_GUEST_EXACT_PATHS as readonly string[]).includes(pathname)) return true;

  return PUBLIC_GUEST_PATH_PREFIXES.some((prefix) =>
    matchesPathPrefix(pathname, prefix),
  );
}

export const GUEST_USERNAME = '__guest__';
