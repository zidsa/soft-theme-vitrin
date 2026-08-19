# Security Guidelines



## Purpose

This storefront theme renders Jinja, HTML, JavaScript, CSS, URLs, product data, CMS content, API responses, and merchant configuration. Treat externally supplied values as untrusted unless the platform explicitly documents a trusted, sanitized HTML contract.

Security changes must preserve legitimate storefront behavior while preventing text from becoming executable markup, JavaScript, CSS, or URLs.

## Required workflow

Before changing rendering code:

1. Identify the value's source.
2. Identify its output context: HTML text, HTML attribute, JavaScript, JSON, URL, CSS, or intentional HTML.
3. Use the protection designed for that context.
4. Add or update a harmless regression test.
6. Review the final diff for new sinks and unrelated changes.

Do not assume that validation in a dashboard, form, SDK, or browser is a security boundary. Values may also arrive from APIs, imports, external applications, URLs, or older stored data.

## Jinja and HTML

### Plain text

Render names, titles, labels, reviews, questions, headings, and configuration text through normal Jinja escaping.

```jinja2
<h1>{{ product.name }}</h1>
```

Never mark plain text as safe.

```jinja2
{# Prohibited #}
<h1>{{ product.name | safe }}</h1>
```

The security regression suite limits `|safe` to the repository's reviewed rich-text fields. Update that allowlist only when the field is intentionally HTML and its platform sanitization or trust contract has been verified.

### Intentional rich text

Current intentional HTML fields include CMS/page bodies, FAQ answers, product descriptions, and platform-generated copyright markup. Do not convert these fields to plain text without confirming the product requirement.

Do not add a custom sanitizer or a regular-expression HTML cleaner. If new untrusted HTML must be supported, use a maintained sanitizer at the correct server or platform boundary and document its allowlist.

### Attributes

- Quote every dynamic attribute.
- Do not place untrusted values in `on*` event attributes.
- Prefer `data-*` attributes plus an event listener.
- Keep identifiers as data; do not concatenate them into selectors or executable code.
- Use schema types such as `color`, `number`, `image`, and `url` for theme settings instead of unrestricted text.

## Jinja inside JavaScript

HTML escaping is not JavaScript escaping. Serialize Jinja values with `tojson` and do not wrap the expression in quotes.

```jinja2
<script>
const title = {{ product.name | tojson }};
const media = {{ product.selected_product.media | tojson }};
</script>
```

The following legacy pattern is prohibited because quotes, backslashes, or `</script>` can escape the intended context:

```jinja2
{# Prohibited #}
<script>
const title = '{{ product.name }}';
</script>
```

Use `tojson` for strings, numbers, booleans, arrays, objects, translations, IDs, URLs, and selector inputs embedded in JavaScript.

## DOM rendering

Use DOM APIs that treat external values as data:

```js
element.textContent = value;
jqueryElement.text(value);
element.setAttribute('data-id', value);
element.appendChild(document.createTextNode(value));
```

Create structured UI with `document.createElement`, properties, and `appendChild`/`append`. Do not assemble HTML strings containing API, product, customer, merchant, CMS, URL, translation, or local-storage values.

Legacy patterns that are prohibited for external values:

```js
element.innerHTML = value;
element.insertAdjacentHTML('beforeend', value);
jqueryElement.html(value);
jqueryElement.append(`<div>${value}</div>`);
```

Static, source-controlled markup may use an HTML API only when DOM construction would materially reduce clarity. Keep dynamic data out of that markup and explain the exception in a nearby comment.

Platform-generated HTML fragments used by product filters and cart templates are intentional HTML boundaries. Do not broaden these sinks to accept arbitrary API or user strings. Continue applying URL validation after inserting a reviewed platform fragment.

## URL handling

Use `assets/theme-security.js` for dynamic navigation and URL validation.

- Allow only `http:` and `https:` for navigation, media, forms, iframes, and stylesheets unless a narrower rule applies.
- Allow `mailto:` and `tel:` only for anchor elements that require them.
- Require same-origin URLs for login redirects and other internal return paths.
- Reject `javascript:`, `data:`, `vbscript:`, malformed URLs, and unsupported schemes.
- Do not assign URL/query values directly to `window.location`.
- Continue using `url_for`, `asset_url`, and `image_url` for platform-generated URLs.

Do not weaken the allowlist to fix a broken link. Confirm the legitimate scheme and update tests first.

## CSS safety

- Dynamic colors must come from `color` schema settings or another constrained platform field.
- Sizes and counts must use numeric schema settings.
- Images must use image settings and platform URL helpers.
- Do not insert arbitrary external text into `<style>`, `style`, selectors, property names, or CSS custom properties.
- Custom stylesheet URLs must pass the URL allowlist before the `href` property is assigned.

## Event handlers

Prefer one source-controlled listener over dynamic inline JavaScript.

```html
<button data-cart-product-id="{{ product.id }}">Add to cart</button>
```

```js
document.addEventListener('click', event => {
  const button = event.target.closest('[data-cart-product-id]');
  if (!button) return;
  productCartAddToCart(button, button.getAttribute('data-cart-product-id'));
});
```

Never build an inline handler from a Jinja value or an API response.

## Dependencies and vendored code

- Reuse existing security utilities before adding a dependency.
- Do not introduce a production dependency without explaining why built-in APIs and existing utilities are insufficient.
- Do not create a custom HTML sanitizer.
- Treat minified files and `libraries/slide-menu-master/` as vendored code. Avoid editing them unless the task explicitly requires a vendor update.
- Review the upstream version, license, integrity, and security history before updating vendored code.

## Harmless security tests

Use inert markers only. Appropriate inputs include:

```text
<script>window.__XSS_TEST__ = true</script>
<img src=x onerror="window.__XSS_TEST__ = true">
</script><script>window.__XSS_TEST__ = true</script>
javascript:window.__XSS_TEST__ = true
data:text/html,<script>window.__XSS_TEST__ = true</script>
```

Tests must verify that payloads remain text, are rejected as URLs, or cannot create executable nodes. Never use payloads that access credentials, cookies, customer data, external endpoints, or destructive actions.

Add security regressions to `test/security-regressions.test.js` when changing templates, DOM rendering, redirects, URL handling, or intentional raw-HTML boundaries.


## Review checklist

- [ ] Plain text is not marked `safe`.
- [ ] Every remaining raw-HTML field is intentional and documented.
- [ ] Jinja data in JavaScript uses `tojson`.
- [ ] External text reaches `textContent`, `.text()`, or equivalent text APIs.
- [ ] No dynamic event-handler attribute was introduced.
- [ ] Redirects and dynamic URLs use the protocol allowlist.
- [ ] Internal redirects are same-origin.
- [ ] Dynamic CSS values are constrained by type.
- [ ] No regex sanitizer or blacklist-only defense was added.
- [ ] Security regression tests cover the changed source-to-sink path.
- [ ] Tests, syntax checks, and diff review pass.
- [ ] Security documentation changes are included in the same review as the code change.

