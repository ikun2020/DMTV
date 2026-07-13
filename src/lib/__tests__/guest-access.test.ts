import { canAccessAsGuest } from '../guest-access';

describe('guest access policy', () => {
  const originalValue = process.env.ENABLE_GUEST_MODE;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env.ENABLE_GUEST_MODE;
    } else {
      process.env.ENABLE_GUEST_MODE = originalValue;
    }
  });

  it.each([
    '/',
    '/search?q=test',
    '/play?source=demo&id=1',
    '/api/search',
    '/api/detail',
    '/api/video-proxy',
  ])('allows explicit public route %s', (pathname) => {
    expect(canAccessAsGuest(pathname.split('?')[0])).toBe(true);
  });

  it.each([
    '/admin',
    '/play-stats',
    '/api/admin/config',
    '/api/favorites',
    '/api/playrecords',
    '/api/user/my-stats',
    '/api/unknown',
  ])('keeps non-public route %s protected', (pathname) => {
    expect(canAccessAsGuest(pathname)).toBe(false);
  });

  it('can restore the original login wall through configuration', () => {
    process.env.ENABLE_GUEST_MODE = 'false';
    expect(canAccessAsGuest('/')).toBe(false);
    expect(canAccessAsGuest('/api/search')).toBe(false);
  });
});
