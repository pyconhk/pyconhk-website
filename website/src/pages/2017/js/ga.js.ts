export const prerender = true;

export function GET() {
  return new Response('', {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
    },
  });
}
