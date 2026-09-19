# THICK. custom domain

Primary domain: `thisisthick.com`.
Alternate domain: `www.thisisthick.com` (GitHub Pages redirects it to the primary domain after both are configured).
Repository: `xirui-li/lalaland-cafe-replica`.

The domain is bound in GitHub Pages with HTTPS enforced. On 2026-09-19, the primary domain's four A records and the alternate domain's CNAME passed GitHub's DNS health checks, and the certificate for both names was approved and served successfully. Deployment uses the root path `/`; the previous project URL redirects to the primary domain.

## DNS setup

The domain is managed through Northwest Registered Agent. Authoritative DNS is hosted at `ns1.hosting.businessidentity.llc` and `ns2.hosting.businessidentity.llc`.

Keep `thisisthick.com` in the repository's Settings → Pages → Custom domain, with these website records at Northwest:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | xirui-li.github.io. |

Northwest requires the CNAME value to end in a dot, exactly as shown above. The target does not include a URL scheme or repository path. The provider's Auto TTL currently publishes these records with a 300-second TTL. Keep a single CNAME for `www`, without an A record at the same name. Leave the existing nameservers, MX, and email-related TXT records in place.

The provider's old `*` A record points to `66.223.49.89`. The explicit `www` CNAME takes precedence over that wildcard; the wildcard is not part of the GitHub Pages configuration.

## Deployment and verification

1. Rerun the GitHub Pages deployment after binding the domain. The workflow reads `base_path` from `actions/configure-pages`, using `/` for this custom domain.
2. Confirm the domain's A records and `www` CNAME match the table. DNS propagation can take up to 24 hours.
3. Once GitHub provisions the certificate, enable **Enforce HTTPS** in Pages settings. That option can take up to 24 hours to become available.
4. Check `https://thisisthick.com/` on desktop and mobile, including logos, photos, video, and home links. Confirm `https://www.thisisthick.com/` redirects to the primary domain.

GitHub Actions deployments do not require a `CNAME` file. The previous `github.io` address redirects after binding the custom domain, so the new DNS records must be configured to complete the switch.

References: [GitHub custom domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [configure-pages outputs](https://github.com/actions/configure-pages/blob/v6/action.yml).
