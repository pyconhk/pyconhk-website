export type Legacy2021PageKind = 'html';

export interface Legacy2021Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  title: string;
  description: string;
  kind: Legacy2021PageKind;
  capturedFile: string;
  fullHtml: string;
  visibleText: string;
}
