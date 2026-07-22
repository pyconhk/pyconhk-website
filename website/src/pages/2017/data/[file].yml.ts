import type { APIRoute, GetStaticPaths } from 'astro';
import { resolveLegacy2017StaticTextAssets } from '@/years/2017/data/assets';
import {
  getLegacy2017StaticText,
  type Legacy2017StaticPath,
  legacy2017StaticTexts,
} from '@/years/2017/data/static';

const dataPaths = Object.keys(legacy2017StaticTexts).filter(
  (path) => path.startsWith('/2017/data/') && path.endsWith('.yml')
) as Legacy2017StaticPath[];

export const prerender = true;

export const getStaticPaths: GetStaticPaths = () =>
  dataPaths.map((staticPath) => ({
    params: { file: staticPath.replace(/^\/2017\/data\//u, '').replace(/\.yml$/u, '') },
    props: { staticPath },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(
    resolveLegacy2017StaticTextAssets(
      getLegacy2017StaticText(props.staticPath as Legacy2017StaticPath)
    ),
    {
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
      },
    }
  );
