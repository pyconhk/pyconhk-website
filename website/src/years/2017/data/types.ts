export type Legacy2017PageKind = 'html';

export interface Legacy2017Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  status: number;
  title: string;
  description: string;
  kind: Legacy2017PageKind;
  capturedFile: string;
  fullHtml: string;
  visibleText: string;
}
