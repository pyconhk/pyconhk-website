export type Legacy2018PageKind = 'html';

export interface Legacy2018Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  title: string;
  description: string;
  kind: Legacy2018PageKind;
  capturedFile: string;
  fullHtml: string;
  visibleText: string;
}
