export type Legacy2016PageKind = 'html';

export interface Legacy2016Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  status: number;
  title: string;
  description: string;
  kind: Legacy2016PageKind;
  capturedFile: string;
  bodyHtml: string;
  visibleText: string;
}
