import route2015 from '@/years/2015/data/routes.json';

export type MigratedTopLevelRoute = {
  from: string;
  to: string;
};

export const migratedTopLevelRoutes =
  route2015.migratedTopLevelRoutes satisfies readonly MigratedTopLevelRoute[];

export const migratedTopLevelRouteTargets = [
  ...new Set(migratedTopLevelRoutes.map((route) => route.to)),
];

const migratedTopLevelRouteSources = new Set(
  migratedTopLevelRoutes.map((route) => normalizeRoutePath(route.from))
);

export function isMigratedTopLevelRoute(pathname: string): boolean {
  return migratedTopLevelRouteSources.has(normalizeRoutePath(pathname));
}

function normalizeRoutePath(pathname: string): string {
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}
