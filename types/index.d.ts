export interface PrintPreset {
  header?: HeaderFooterOptions | null;
  footer?: HeaderFooterOptions | null;
  waitForSelector?: string | null;
}

export interface PrintPresetMap {
  [k: string]: PrintPreset;
}

export interface HeaderFooterOptions {
  html?: string | null;
  selector?: string | null;
}

export interface PrintRequest extends PrintPreset {
  url?: string | null;
  html?: string | null;
  preset?: string | null;
}
