import { programmeSnapshot } from '@/years/2026/data/schedule';

export const prerender = true;

export function GET(): Response {
  return Response.json(programmeSnapshot, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
