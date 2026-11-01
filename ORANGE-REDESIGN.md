# SLKM orange redesign

## Compact navigation refinement

The existing orange identity is retained with smaller public layout tokens: 64px mobile header, 74px desktop header, 33px announcement bar including its border, 13px desktop navigation, a 440px desktop hero, reduced section/card/form spacing, and a smaller safe-area-aware mobile dock. Mobile controls retain comfortable touch targets and form inputs keep 16px text.

Desktop navigation is visible from 1024px and shares exactly six translated entries with the mobile drawer: **Accueil**, **Lignes & agences**, **Messageries**, **Notre histoire**, **Transport de personnel**, **Contact**. Their existing routes are `/`, `/lignes`, `/irsaliyat`, `/about`, `/services`, `/contact`. The `/services` page already provides staff transport and its quote form. News remains accessible through the footer. No page, reservation handler, data source, authentication logic or SQL schema was removed or changed.

The logical-start hamburger and icon drawer mirror correctly in Arabic. The existing focus handling, Escape/backdrop dismissal and language switching are retained. Desktop links have an orange active indicator and a directional hover underline.

`src/app/locale-actions.ts` now updates the same language cookie through a validated preference action. This synchronizes the shared layouts and current page and invalidates prefetched content from the previous language, following [Next.js cookie action behavior](https://nextjs.org/docs/app/api-reference/functions/cookies). It replaces manual HTML attribute changes and a separate router refresh; booking, contact, quote and authentication actions are unchanged.

Rapid navigation also exposed a delayed Leaflet initial-zoom callback after map removal. Initial map fitting now runs without animation, cleanup stops active panning before removal, and map animations respect reduced-motion preferences. Agency coordinates, route selection and manual map controls are preserved.

Modified presentation files: `src/app/globals.css`, `src/components/site-header.tsx`, `site-footer.tsx`, `ui.tsx`, route/agency/blog cards, contact/quote/tracking forms, the transport explorer, the parcel-network section and the existing public page components. `scripts/test-public-ui.cjs` now checks exact menu order/translations, active states, header sizing, overlapping controls, all six actual navigation links, sticky behavior and Arabic drawer direction, in addition to the earlier booking and data checks. Current screenshots and reports are written to `artifacts/compact/`.

The refinement is checked at 360, 390, 430, 768, 1024, 1280 and 1440px, plus 320 and 375px, across FR/AR/EN. The browser suite covers 198 responsive layouts and six interaction groups; its report is saved in `artifacts/compact/qa-report.json`.

The existing Next.js application has been restyled in place. Public pages use orange `#F97316`, hover `#EA580C`, pale orange `#FFF7ED`, soft orange `#FFEDD5`, white, ink `#172033`, muted `#64748B` and background `#F8FAFC`.

Public tokens are scoped to `.public-site` in `src/app/globals.css`. The Tailwind primary soft/bright tokens accept CSS variable overrides, retaining the existing defaults in administration. Dark text on orange buttons and darker orange for small text provide better contrast. Existing local Plus Jakarta fonts and the original SLKM photographs remain in use.

## Implementation

- `src/components/site-header.tsx`: compact header, native language dropdown, desktop active states, native modal navigation drawer, existing WhatsApp booking destination and mobile dock. The drawer supports Escape, backdrop dismissal, same-route dismissal, focus restoration, scroll locking and desktop resize dismissal.
- `src/components/dialog-focus.ts`: reusable Tab/Shift+Tab wrapping for the navigation and parcel-map dialogs.
- `src/components/locale-switcher.tsx`, `src/app/locale-actions.ts`: compact dropdown alongside the three-button selector, using the existing locale cookie and synchronized preference action.
- `src/app/(site)/layout.tsx`, `src/app/layout.tsx`: public theme scope, translated skip link, focusable main landmark, safe-area viewport and orange browser theme color.
- `src/app/(site)/page.tsx`: original bus photograph, editorial hero, orange exploration/booking CTA, service shortcuts, translated booking steps, commitment cards and compact mobile service/fleet cards. Fleet, routes, agencies and articles still come from their existing sources.
- `src/components/ui.tsx`, route/agency/blog cards, contact/quote forms and footer: consistent buttons, fields, headings, photo cards, tap targets, autocomplete and mobile spacing.
- `src/components/transport-network-explorer.tsx`: existing search/filter/map behavior; three initial homepage results, with the existing show-more control. The routes page retains six initial results.
- `src/components/agency-map.tsx`, `messagerie-network-section.tsx`, `messagerie-map-image.tsx`: orange styling, existing agencies/coordinates and stored parcel-map image. The image remains contained and expandable; the modal also locks background scrolling and restores focus.
- Public history, services, contact, news and parcel pages: shared orange presentation, neutral dark surfaces and helpful customer-facing empty states. Parcel agencies can display even when the optional network-settings row is absent.
- New public `loading.tsx` and `error.tsx`, plus localized root `not-found.tsx`: consistent loading, retry and recovery presentation.

Supabase clients, environment variables, tables, authentication, booking/contact/quote actions, business validation rules and database writes were not changed. Existing routes and SEO metadata are retained. No business records, statistics or runtime dependencies were added. Pre-existing workspace changes were preserved.

## Verification

- `node scripts/test-transport.cjs`: 14 assertions.
- `node scripts/test-messagerie.cjs`: 12 rendering assertions.
- `npx tsc --noEmit --incremental false`.
- `node scripts/test-public-ui.cjs`: 198 responsive checks in headless Edge across 320, 360, 375, 390, 430, 768, 1024, 1280 and 1440 pixels. All seven public pages are checked in FR/AR/EN, plus a published article at all nine widths. Checks cover exact six-item menus/translations, navigation clicks, active states, compact header dimensions, header overlap, sticky behavior, document direction, overflow, field clipping, dock clearance, drawer keyboard/backdrop behavior, the FR–AR–EN–FR language cycle, route filters, persisted search parameters, WhatsApp URL contents, tracking reference handoff, required form fields and the unauthenticated admin redirect. Parcel-map modal checks run when a map is published.
- `node scripts/preview-orange.cjs`: scrolls the public pages to load lazy images and saves full-page screenshots; no broken content images found.
- `npm run build`: passed, including type checks and all 15 generated pages.
- `scripts/smoke-public.cjs` against the production build: 18 read-only checks passed, covering public routes, locale/network rendering, admin protection, the published article, robots and sitemap. Additional production browser checks passed for mobile/desktop overflow and localized 404 recovery in all three languages.

Browser scripts use a locally installed Playwright package and the installed Edge browser; Playwright is not added to application dependencies. To reproduce: `npm install --no-save --package-lock=false playwright`, then run the scripts. `SLKM_TEST_URL` can override the local server URL; the responsive suite also accepts `SLKM_BROWSER_CHANNEL`.

Current screenshots and the browser QA report are stored in the ignored `artifacts/compact/` directory; original orange redesign captures remain in `artifacts/orange/`. Checks do not create contact submissions or corporate quote records, or send WhatsApp messages; only the browser's language preference is changed. Browser verification covers Chromium/Edge at the requested viewport sizes; it does not substitute for testing physical iOS/Android devices.
