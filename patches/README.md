`decap-cms-core@3.16.0.patch` fixes the second language editor pane calling an
optional `onLocaleChange` callback unconditionally. The second pane maintains its
own selected language and is rendered without that callback; the first pane's
callback still runs when present. The patch changes only that invocation in the
installed ESM build and corresponding source.

Bun applies this version-specific patch through the root `patchedDependencies`.
The CMS regression test exercises the installed handler with and without the
callback. Review and remove the patch when a Decap upgrade includes the fix.
