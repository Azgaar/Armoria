# SvelteKit default-branch cutover

This is the release checklist for merging the combined SvelteKit app/API into `master`, the existing default branch. It does not rename the branch or change Vercel settings. #188 was closed without merging; #161 remains the broader integration tracker.

## Prepared changes

- #275 finishes the editor coordinator and fixes consecutive-edit undo history (#260). Require its merge and upstream deployment verification before completing this cutover.
- The ancestry-only merge reconciles `master` at `b0bb9b8` with the SvelteKit tree. Its eight apparently missing commits (#213–#219 and Crowdin #204) were already ported by squash commit `86d81b6` (#220). The conflict resolutions retain the tested SvelteKit implementations; Turkish translations are byte-identical in `static/locales/tr/lang.json`. The reconciliation changes no application files.
- Validation runs for PRs and pushes on both `master` and `sveltekit`. The legacy Rollup workflow is removed so merging cannot publish a missing `public` build over GitHub Pages. Crowdin's manifest workflow watches nested locale files on `master` and has explicit permissions for its existing update PR.
- The About API link points to this repository's API documentation. FMG's editor and About links are changed in a separate companion PR, including its expected return-message origin and backwards-compatible parsing of old edit links.

## Remaining issue assessment — 2026-11-20

| Issue | Evidence and proposed release treatment                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #260  | Must land and be verified before cutover. All 29 editor components are migrated by #275; three new history regressions fail on `fddc0c8` and pass there.                                                                                                                                                                                                                                                                                                    |
| #261  | Retain as a separate rendering migration. The SVG components are supported Svelte 5 legacy components; browser/API parity is already regression-tested. Proposed follow-up, not an implicit claim that the work is complete.                                                                                                                                                                                                                                |
| #262  | Still open. npm publishes Puppeteer 25.18.1, whose supported Chrome is 157.0.8103.78; Sparticuz's latest is 153.0.0. Retain the supported 25.11.0/153 pairing pending a compatible patched release. Four high audit entries propagate from one Zod advisory in the unused BiDi path. Armoria selects CDP, bounds inputs, disables page scripts, and blocks raster network/file requests. Maintainer acceptance of this residual exposure is a release gate. |
| #264  | Still open. deepmerge 4.3.1, svelte-i18n 4.0.1 and the Svelte plugin 7.3.1 remain the latest published versions. Keep the tested deepmerge guard/pin, patch-package and localization esbuild override. Today's audit lists only the four BiDi/Zod entries; that does not establish an upstream deepmerge fix or justify removing the guard. Proposed upstream-cleanup follow-up.                                                                            |

Sources: [Puppeteer browser mapping](https://pptr.dev/supported-browsers), [Sparticuz releases](https://github.com/Sparticuz/chromium/releases), npm registry metadata and `npm audit --json` against the committed lockfile. The current audit snapshot is `docs/dependency-audits/cutover-2026-11-20.json`. No dependency versions or lockfile entries change in this cutover.

#237 requires all scoped work to be completed or explicitly moved to agreed follow-ups. Record acceptance of the proposed #261/#262/#264 follow-ups there before treating #237/#238 as complete. #161 also discusses future shared FMG renderer/generator packages; this merge does not implement that integration.

## Release gates and order

1. Merge #275 into `sveltekit`; verify its exact upstream CI/Vercel result and public HTML/assets. Close #260 only after that verification. Reconcile any later branch changes into this draft and require green CI on the final tree.
2. Agree the remaining issue treatment above. Confirm existing claim clients use POST/DELETE `/api/claims/{name}`; legacy GET mutations return 410. Older deployments that mutate the same claims database must not remain accessible after hash migration. Rollback must understand `keyHash` or disable claim mutations.
3. In Vercel, inspect the actual domain assignment, production branch, Node 24 runtime and Production environment variables. Current GitHub deployment labels say Preview despite the public domain serving them. Preserve the existing project's domain and credentials; do not infer private configuration from a successful build. Prepare `master` as the production branch and coordinate activation with this merge. Private project configuration has not been inspected during this preparation.
4. Merge this cutover PR into `master`, then activate/verify the intended Vercel production branch and public alias. Confirm the successful deployment belongs to the actual merge commit, not only a fork preview. Keep the last verified deployment available for rollback.
5. Verify public editor consecutive edits/undo/redo, share/reload, downloads and metadata, SVG/PNG/JPEG/JPG endpoints, legacy image redirects, translations and offline update behavior. Use isolated fixtures for claim mutations and Discord; do not test by changing production claims or sending messages.
6. Merge/release the companion FMG links PR after the Vercel editor is verified. Check a live edit/undo/redo round trip with the new origin; keep session-token/map checks. Update the GitHub repository homepage from the Pages URL to `https://armoria.vercel.app/` (requires repository admin access), and inventory wiki/external links separately.

## Legacy hosting and saved resources

GitHub Pages currently serves `gh-pages` at `/Armoria/`. Leave that existing deployment in place during the transition. Do not overwrite it with SvelteKit's Vercel output or install an automatic redirect in this release.

A redirect would change the origin of older FMG editing sessions: their receiver correctly rejects messages from the unexpected Vercel origin. Saved custom charges, fonts, palettes and settings also live under the old origin's browser storage and are not automatically available on Vercel. Retaining the old page keeps those resources reachable while migration/export guidance is prepared. Existing explicit-COA links remain usable; seeded generation is not guaranteed identical between app versions.

Retirement of the old app is a follow-up requiring a saved-resource transfer/export path, a compatibility plan for older FMG sessions, and a narrowly scoped service-worker retirement. Do not clear all storage/caches or unregister every service worker on `azgaar.github.io`: FMG shares that origin. This release does not claim the frozen legacy app receives the new security fixes.

## Verification evidence

#275 passed 211 service/browser tests, strict application/service-worker checks (0 errors and the existing 92 accessibility warnings), a credential-free Vercel build, three deployment-output tests and one production update/offline test. Nine representative exports retain identical metadata, PNG bytes and SVG content except random instance IDs. Record the cutover's own CI and deployment results on its PR before completing the release gates.

### Editor merge verified

#275 merged as `f72fb1e1e1f90cbc99b3109f3b54033918d307bb`, with the same tree as tested `e32e561`. Its [upstream CI](https://github.com/Azgaar/Armoria/actions/runs/44805071950) passes. Vercel reports a successful [deployment](https://armoria-bb6zj1twa-azgaars-projects.vercel.app); public HTML, service worker and all 12 referenced hashed entry assets match it. Isolated public-browser checks pass consecutive shadow edits, both undo/redo steps, shared URL and reload without page errors. Public SVG/PNG/JPEG/JPG requests succeed. Only GET/HEAD requests were allowed in the browser; no production claims or Discord messages were changed.

The cutover tree also passes strict checks (0 errors, 92 existing warnings), the credential-free Vercel build and all four production/deployment tests. Workflow YAML parsing confirms validation on both branches, removal of the legacy deploy job and nested locale triggers. Private hosting configuration and the explicit follow-up decisions remain release gates.
