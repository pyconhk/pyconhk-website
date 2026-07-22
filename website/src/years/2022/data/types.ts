export type Legacy2022PageKind = 'html';

export interface Legacy2022Page {
  route: string;
  sourceRoute: string;
  sourceUrl: string;
  title: string;
  description: string;
  kind: Legacy2022PageKind;
  capturedFile: string;
  fullHtml: string;
  visibleText: string;
}
