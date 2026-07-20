export type Legacy2023PageKind = 'html';

export interface Legacy2023Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  title: string;
  description: string;
  kind: Legacy2023PageKind;
  capturedFile: string;
  fullHtml: string;
  visibleText: string;
}
