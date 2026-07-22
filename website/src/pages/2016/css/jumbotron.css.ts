export const prerender = true;

const jumbotronCss = `body {
  padding-top: 50px;
  padding-bottom: 20px;
}
`;

export function GET() {
  return new Response(jumbotronCss, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
    },
  });
}
