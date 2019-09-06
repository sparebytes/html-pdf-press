import { Page } from "puppeteer";
export function tryExtractHtmlAndRemove(page: Page, selector: string): Promise<string | null>;
export function tryExtractHtmlOfMany(page: Page, selector: string): Promise<string[]>;
export function waitForImagesToLoad(page: Page): Promise<boolean>;
export function waitForFontsToLoad(page: Page): Promise<unknown>
export function blurActiveElement(page: Page): Promise<void>;
