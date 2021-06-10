export type PageSize = 'letter' | 'legal' | 'tabloid' | 'ledger' | 'a0' | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6';

                       

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
  format?: PageSize | null;
  width?: string | null;
  height?: string | null;
  preferCSSPageSize?: boolean;
}

export interface PrintPresetMap {
  [k: string]: PrintPreset;
}

export interface HeaderFooterOptions {
  html?: string | null;
  htmlHeight?: string | null;
  selector?: string | null;
  scalingFudge?: number | null;
  wrapperStyle?: string | null;
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

export interface PageFormats {
  [k: string]: [string, string] | null | undefined;
}
