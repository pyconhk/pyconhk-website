import { legacy2015ResourceResponse } from '@/years/2015/data/resource-response';

export const prerender = true;

export function GET() {
  return legacy2015ResourceResponse('/2015/css/bootstrap.min.css/', 'text/css');
}
