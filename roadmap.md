# Security remediation roadmap

- [x] Review the completed security scan and identify the exact image and settings policies.
- [x] Apply scoped image reads and storefront-only settings reads without changing customer or order records.
- [ ] Verify anonymous, customer, Moderator, and Admin access separately, including signed image URLs.
- [ ] Run a fresh security scan and confirm the current build status.
- [ ] Report remaining findings and any access tests that could not be completed.

## XAMPP conversion

- [x] Confirmed transfer scope: public site content and product catalog only; no live customer accounts, orders, newsletter signups, or audit records are copied.
- [ ] Prepare and approve the full PHP/MySQL XAMPP conversion plan.
- [ ] Build and package the standalone XAMPP website without changing the existing Lovable app or live data.
- [ ] Verify routes, checkout/tracking, staff permissions, responsive layouts, and ZIP contents; report any unavailable runtime checks.
- [x] Confirmed Moderators may view/change payment status only; revenue, reports, and role/settings controls stay Admin-only.