import {
  blurActiveElement,
  tryExtractHtmlAndRemove,
  tryExtractHtmlOfMany,
  waitForFontsToLoad,
  waitForImagesToLoad,
} from "@html-pdf-press/puppeteer-util";
import { HeaderFooterOptions, PrintRequest, PrintPreset } from "@html-pdf-press/types";
import { Controller, Get, HttpException, HttpStatus, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { Page, PDFOptions } from "puppeteer";
import { appConfig } from "./app-config";
import { AppService } from "./app.service";
import { printRequestValidator } from "./validators";

import deepMerge = require("lodash/merge");

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getPdf(@Res() res: Response, @Query() params: PrintRequest): Promise<void> {
    const paramsValidated = printRequestValidator(params).unwrap();
    const options = mergePresets(paramsValidated);

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
      const headerHtml = await determineHeaderFooterHtml(page, options.header);
      const footerHtml = await determineHeaderFooterHtml(page, options.footer);

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

async function determineHeaderFooterHtml(page: Page, headerFooterOptions: HeaderFooterOptions | null | undefined): Promise<string | null> {
  if (!headerFooterOptions) {
    return null;
  }
  let html: string | null | undefined = null;
  if (headerFooterOptions.selector) {
    html = await tryExtractHtmlAndRemove(page, headerFooterOptions.selector);
  } else {
    html = headerFooterOptions.html;
  }
  return html == null ? null : html;
}

function mergePresets(printRequest: PrintRequest): PrintRequest {
  const presets: PrintRequest[] = [
    ...getPresets(appConfig.presetBase),
    ...getPresets((printRequest.preset || "").split(",")),
    printRequest,
    ...getPresets(appConfig.presetFinal),
  ];
  const result = deepMerge({}, ...presets);
  return result;
}

function getPresets(names: Array<string | null>): PrintPreset[] {
  const appPresets = appConfig.presets;
  const presets = names.map(n => (n ? appPresets[n] : null)).filter(p => p) as PrintPreset[];
  return presets;
}
