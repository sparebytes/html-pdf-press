import {
  blurActiveElement,
  tryExtractHtmlAndRemove,
  tryExtractHtmlOfMany,
  waitForFontsToLoad,
  waitForImagesToLoad,
} from "@html-pdf-press/puppeteer-util";
import { Controller, Get, HttpException, HttpStatus, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { PDFOptions, Page } from "puppeteer";
import { assertTypeFn } from "typesmith";
import { appConfig } from "./app-config";
import { AppService } from "./app.service";

export interface HeaderFooterOptions {
  html?: string | null;
  selector?: string | null;
}

export interface PrintOptions {
  url?: string | null;
  html?: string | null;
  header?: HeaderFooterOptions | null;
  footer?: HeaderFooterOptions | null;
  waitForSelector?: string | null;
}

const validatePrintJobOptions = assertTypeFn<PrintOptions>({
  coerceTypes: true,
  removeAdditional: "failing",
});

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getPdf(@Res() res: Response, @Query() params: PrintOptions): Promise<void> {
    const options = validatePrintJobOptions(params).unwrap();

    if (!params.html && !params.url) {
      throw new HttpException('"url" or "html" must be specified', HttpStatus.BAD_REQUEST);
    }

    const printService = await this.appService.getPrintService();
    const pdfBuffer = await printService.usePage(async page => {
      // Initialize PDF Output Options
      const pdfOptions: PDFOptions = {};

      // Goto the URL
      if (options.url) {
        await page.goto(options.url, {
          // timeout: loadTimeout,
          waitUntil: ["load", "domcontentloaded"],
        });
      }

      // Set Html Content
      if (options.html) {
        await page.setContent(options.html);
      }

      // Wait for element
      if (options.waitForSelector) {
        await page.waitFor(options.waitForSelector);
      }

      // Wait for images
      await waitForImagesToLoad(page);

      // Wait for web font loading completion
      await waitForFontsToLoad(page);

      // Determine Header/Footer Html
      const headerHtml = await determineHeaderFooterHtml(page, "header", options.header);
      const footerHtml = await determineHeaderFooterHtml(page, "footer", options.footer);

      // Determine if we should show the header and footer
      pdfOptions.displayHeaderFooter = !!(headerHtml || footerHtml);

      // Apply Header and Footer Html
      if (pdfOptions.displayHeaderFooter) {
        // Extract style tags into header and footer
        const extractedStyleTags = await tryExtractHtmlOfMany(page, "style");
        const extractedStyleCss = extractedStyleTags.join("\n");
        if (headerHtml) {
          pdfOptions.headerTemplate = extractedStyleCss + headerHtml;
        }
        if (footerHtml) {
          pdfOptions.footerTemplate = extractedStyleCss + headerHtml;
        }
      }

      // Blur the activeElement to prevent cursor in text box
      await blurActiveElement(page);

      return page.pdf();
    });

    res.status(200);
    res.contentType("application/pdf");
    res.set({ "Content-Length": pdfBuffer.length });
    res.send(pdfBuffer);
  }
}

async function determineHeaderFooterHtml(
  page: Page,
  type: "header" | "footer",
  headerFooterOptions: HeaderFooterOptions | null | undefined,
): Promise<string> {
  const defaults = appConfig.defaults[type];
  let html: string | null = null;
  const selector = headerFooterOptions && "selector" in headerFooterOptions ? headerFooterOptions.selector : defaults.selector;
  if (selector) {
    html = await tryExtractHtmlAndRemove(page, selector);
  }
  html = html || (headerFooterOptions && headerFooterOptions.html) || defaults.html || "";
  return html;
}
