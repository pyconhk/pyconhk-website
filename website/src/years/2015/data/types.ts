export type Legacy2015PageKind = 'html' | 'compatibility';

export interface Legacy2015Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  status: number;
  title: string;
  description: string;
  kind: Legacy2015PageKind;
  capturedFile: string;
  bodyHtml: string;
  visibleText: string;
}
