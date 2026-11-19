// Regression test for ZID-00194: the post-login redirect_to sink must reject cross-origin targets.
// Add at test/security-regressions.test.js and wire `"test": "node test/security-regressions.test.js"`.
const assert = require('node:assert/strict');
const { getSafeNavigationUrl, isAllowedUrl } = require('../assets/theme-security.js');

const origin = 'https://store.test';

// The report's payload and its bypass shapes.
for (const value of [
  'https://attacker.test/collect',
  'https://example.net',
  '//attacker.test/collect',
  'https://store.test@attacker.test/',
  'https://attacker.test\\@store.test/',
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  '',
]) {
  assert.equal(getSafeNavigationUrl(value, origin, true), null, `must reject ${value}`);
}

// Legitimate same-origin targets keep working.
assert.equal(getSafeNavigationUrl('/account', origin, true), `${origin}/account`);
assert.equal(getSafeNavigationUrl('https://store.test/cart', origin, true), `${origin}/cart`);

// Assets and product URLs only need the protocol gate.
assert.equal(getSafeNavigationUrl('https://cdn.zid.store/x.png', origin, false), 'https://cdn.zid.store/x.png');

// mailto and tel are allowed only where the caller asks for them.
assert.equal(isAllowedUrl('mailto:a@b.c', origin, ['http:', 'https:']), false);
assert.equal(isAllowedUrl('mailto:a@b.c', origin, ['http:', 'https:', 'mailto:', 'tel:']), true);
assert.equal(isAllowedUrl('tel:+966500000000', origin, ['http:', 'https:', 'mailto:', 'tel:']), true);

console.log('security regressions: ok');
