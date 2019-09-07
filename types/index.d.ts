export type PageSize = "Letter" | "Legal" | "Tabloid" | "Ledger" | "A0" | "A1" | "A2" | "A3" | "A4" | "A5" | "A6";

export interface PrintPreset {
  header?: HeaderFooterOptions | null;
  footer?: HeaderFooterOptions | null;
  waitForSelector?: string | null;
  margins?: MarginsNormalized | null;
  /**
   * @minimum 0.1
   * @maximum 2
   */
  scale?: number;
  printBackground?: boolean;
  landscape?: boolean;
  pageRanges?: string;
  format?: PageSize;
  width?: string | null;
  height?: string | null;
  preferCSSPageSize?: boolean;
}

export interface PrintPresetMap {
  [k: string]: PrintPreset;
}

export interface HeaderFooterOptions {
  html?: string | null;
  selector?: string | null;
}

export interface MarginsNormalized {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export type Margins = number | string | Array<string | number> | MarginsNormalized;

export interface PrintRequest extends PrintPreset {
  url?: string | null;
  html?: string | null;
  preset?: string | null;
}
