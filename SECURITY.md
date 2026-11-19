# Security policy

This is a static site on GitHub Pages: no server, no database, no cookies, no accounts. The only thing a visitor can send is the contact form, which goes to [Web3Forms](https://web3forms.com).

## Reporting a vulnerability

Please report problems privately, not in a public issue:

- use GitHub's [private vulnerability reporting](https://github.com/Polluxgnr/Personal_website/security/advisories/new), or
- write through the [contact form](https://polluxgronier.me/contact/) and mark the message "security".

I'll reply within a few days. Thank you for looking.

## What is in place

- **Content-Security-Policy** (generated at build time with script and style hashes): no `unsafe-inline`, no `unsafe-eval`, requests only to the site itself and to the Web3Forms API, no frames, no plugins, `upgrade-insecure-requests`.
- **No third-party code on the page.** Fonts, icons and animation libraries are bundled with the site, so no CDN can change what runs in your browser. A test fails the build if the page makes a request to any other origin.
- **Visit counting** (when a site code is set) uses GoatCounter: no cookies, no stored IP addresses, no scripts from them (the page sends a single request), and the CSP allows only that one origin. See the [privacy page](https://polluxgronier.me/privacy/).
- **Strict referrer policy** and HTTPS enforced by GitHub Pages.
- **Supply chain:** every GitHub Action is pinned to a full commit SHA, workflows run with read-only permissions unless a job needs more, Dependabot proposes monthly updates, `npm audit` runs in CI, and a dependency review runs on pull requests.
- **Code scanning:** CodeQL on every push, every pull request and weekly.
- **Secrets:** none in the repository. The one key on the site, the Web3Forms access key, is public by design and only identifies an inbox.
- **Contact form:** a hidden honeypot field drops simple bots, and the page reports plainly when a message did not go out.

## What a static host cannot do

GitHub Pages does not let me set HTTP response headers, so `Permissions-Policy`, `X-Content-Type-Options` and `frame-ancestors` cannot be sent, and the CSP is delivered in a `<meta>` tag. If the site ever moves behind a CDN that allows headers, those come first.
