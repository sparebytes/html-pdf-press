import { Page } from "puppeteer";
export function tryMeasureAndExtractHtmlAndRemove(
  page: Page,
  selector: string,
  withOverflow?: boolean,
  includeMargins?: boolean,
): Promise<{ html: string; height: number } | null>;
export function measureHeight(page: Page, selector: string): Promise<number | null>;
export function tryExtractHtmlOfMany(page: Page, selector: string): Promise<string[]>;
export function waitForImagesToLoad(page: Page): Promise<boolean>;
export function waitForFontsToLoad(page: Page): Promise<unknown>;
export function blurActiveElement(page: Page): Promise<void>;
