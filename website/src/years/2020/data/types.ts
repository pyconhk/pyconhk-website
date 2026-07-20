export type Legacy2020PageKind = 'html';

export interface Legacy2020Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  title: string;
  description: string;
  kind: Legacy2020PageKind;
  capturedFile: string;
  fullHtml: string;
  visibleText: string;
}
