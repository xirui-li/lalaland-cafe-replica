# THICK. custom domain

Primary domain: `thisisthick.com`.
Alternate domain: `www.thisisthick.com` (GitHub Pages redirects it to the primary domain after both are configured).
Repository: `xirui-li/lalaland-cafe-replica`.

Status: deployment supports both the custom domain root and the current project path. Pages binding and DNS updates are pending access to the domain provider. Coordinate these steps together to keep the current website available until the domain can be pointed to GitHub.

## DNS setup

On 2026-09-19, authoritative DNS was hosted at `ns1.hosting.businessidentity.llc` and `ns2.hosting.businessidentity.llc`. The primary domain had no A or AAAA record. The `www` host had an A record pointing to `66.223.49.89`.

First bind `thisisthick.com` in the repository's Settings → Pages → Custom domain. Then update website records in the existing DNS provider:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | xirui-li.github.io |

Replace the existing `www` A record with the CNAME record; they cannot coexist at the same name. The CNAME target does not include a URL scheme or repository path. Use the provider's default TTL. Leave the existing nameservers, MX, and email-related TXT records in place.

## Deployment and verification

1. Rerun the GitHub Pages deployment after binding the domain. The workflow reads `base_path` from `actions/configure-pages`, using `/` for this custom domain.
2. Confirm the domain's A records and `www` CNAME match the table. DNS propagation can take up to 24 hours.
3. Once GitHub provisions the certificate, enable **Enforce HTTPS** in Pages settings. That option can take up to 24 hours to become available.
4. Check `https://thisisthick.com/` on desktop and mobile, including logos, photos, video, and home links. Confirm `https://www.thisisthick.com/` redirects to the primary domain.

GitHub Actions deployments do not require a `CNAME` file. The previous `github.io` address redirects after binding the custom domain, so the new DNS records must be configured to complete the switch.

References: [GitHub custom domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [configure-pages outputs](https://github.com/actions/configure-pages/blob/v6/action.yml).
