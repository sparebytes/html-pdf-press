export interface PrintPreset {
  header?: HeaderFooterOptions | null;
  footer?: HeaderFooterOptions | null;
  waitForSelector?: string | null;
  margins?: MarginsNormalized | null;
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
