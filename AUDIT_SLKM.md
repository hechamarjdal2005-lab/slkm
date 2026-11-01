# SLKM project audit

Initial audit: 2026-10-30. This file records the repository state before the CMS/Arabic implementation. Production schema changes are **not authorized for automatic execution**.

## Architecture and inventory

- Next.js 15.5.28 App Router, React 19.1, strict TypeScript, Tailwind 3, local Plus Jakarta Sans, Supabase JS/SSR and Leaflet. No lint script/configuration is provided.
- Public routes: `/`, `/lignes`, `/irsaliyat`, `/services`, `/about`, `/blog`, `/blog/[slug]`; global 404, loading/error boundaries, sitemap and robots. `/services` already covers staff transport, tourism and school transport. No new business route is needed.
- Shared shell: `(site)/layout`, SiteHeader, SiteFooter, LocaleSwitcher, native dialog drawer, focus wrapper and safe-area dock. Exactly six main navigation destinations must remain fixed.
- Public data: `queries.ts` uses a stateless anonymous client and React request memoization; authenticated SSR clients handle admin actions. Booking is an agency-specific WhatsApp URL; tracking also hands the reference to WhatsApp. Contact/quote submissions use existing server actions and real tables.
- Existing admin: tabbed dashboard, business CRUD, fleet/timeline/services editors, settings, parcel network, messages and quotes. Login is Supabase Auth. Writes check trusted `user.app_metadata.role === 'admin'`.
- Schema reviewed: `supabase/schema.sql`, `seed.sql`, existing `20261030180000_messagerie_network.sql` and its standalone counterpart. Existing tables: agencies, routes, parcel_rates, corporate_quotes, contact_messages, blog_posts, site_settings, messagerie_network_settings, messagerie_agencies. Existing indexes, FK restrictions, update triggers, policies and storage bucket policies are defined in those files.
- Reuse `site_settings` for identity/contact/theme, its `analytics_config` for fleet/timeline/service collections, existing blog tables for articles, and existing parcel/agency tables for their business data. Do not create parallel global, translation or business tables.
- Static export HTML/CSS/images are design references, not application routes. Existing image assets and fonts were inventoried. Compatibility route-search/lines-explorer files re-export the shared explorer.

## Findings and implementation decisions

1. **Arabic typography:** no real Arabic webfont is loaded; Tahoma is the fallback. Latin tracking, uppercase and tight headings propagate into Arabic, including multilingual admin fields. Add locally hosted Cairo through next/font, remove Arabic tracking/uppercase, establish Arabic heading/body scales and bidi isolation.
2. **RTL:** root language/direction and logical drawer behavior exist. Administrative chrome remains French inside a potentially RTL document; some forms use physical left/right padding and number/email strings lack isolation. Give French operational chrome an explicit LTR scope and Arabic field groups an explicit Arabic scope; fix directional icons, mixed strings and numeric inputs.
3. **Content:** homepage titles, explanatory steps, commitment cards, history narrative, most page headings/copy and many photos are hardcoded. Existing fleet/timeline/services are editable but not page layout, publication, SEO, branding or media upload. Add controlled CMS pages/sections with multilingual fields and safe layout/design choices. Extract legitimate defaults from actual source content, not invented business records.
4. **Authorization:** middleware currently permits any authenticated user into admin; admin snapshot/entity reads do not independently check the role. RLS limits much of the data but must not substitute for the application role guard. Enforce the same trusted admin claim at middleware, layout/read and write boundaries.
5. **Storage:** the original schema's upload/update policies allow every authenticated user to alter public media. A new reviewable migration must restrict these to `is_admin()`. New CMS media should use a private bucket with published-media SELECT policies and expiring read URLs, plus FK-protected media references.
6. **Design:** orange tokens and compact sizing exist, but repeated literals and utility overrides remain. Preserve the current identity and reduce excess spacing carefully. Add constrained theme settings (validated colors, typography/layout/button presets) without arbitrary CSS/HTML execution.
7. **Admin usability:** raw social JSON, path-only image fields, no reusable media picker, no page editor and no page/section ordering. Add understandable forms, media previews/upload/selection, page copy search, translated fields, publish controls, save/cancel/reset and destructive confirmation. Existing business CRUD remains.
8. **Performance/SEO:** dynamic CMS reads should be request-deduplicated, anonymous and publication-filtered; mutations should invalidate relevant routes. Global and per-page metadata must consume CMS values. Preserve stable image dimensions, lazy loading, accessible states and reduced motion.

## Database plan

Extend the singleton `site_settings` with validated presentation JSON. Add only missing `site_pages`, `site_sections`, `site_media_assets` and `site_page_media` relationships. Preserve all existing schemas/data and helpers. Public reads must be limited to published/active content; writes require the trusted admin claim, not merely an authenticated session. Do not add SECURITY DEFINER functions or expose service keys.

Repository migrations describe intended schema; public credentials do not expose the production catalog, migration ledger, triggers or all RLS definitions. Verify those against staging/production using the migration guide before approval. No remote schema migration will be applied by this task.

## Validation plan and limitations

Run TypeScript, available business tests, production build, responsive/RTL/browser navigation checks, local PostgreSQL-compatible migration/RLS tests, validation/action tests and CMS rendering/save integration tests. Authenticated live save/upload checks require the approved migrations and a real admin session; clearly distinguish local tests from production verification. No business records or production admin accounts will be created as test fixtures. Final outcomes and manual steps are recorded in ADMIN_CMS_GUIDE.md and SUPABASE_MIGRATION_GUIDE.md.
