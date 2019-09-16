import {
  blurActiveElement,
  tryExtractHtmlOfMany,
  tryMeasureAndExtractHtmlAndRemove,
  waitForFontsToLoad,
  waitForImagesToLoad,
} from "@html-pdf-press/puppeteer-util";
import { HeaderFooterOptions, MarginsNormalized, PrintPreset, PrintRequest } from "@html-pdf-press/types";
import { Controller, Get, HttpException, HttpStatus, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { Page, PDFOptions } from "puppeteer";
import { appConfig } from "./app-config";
import { AppService } from "./app.service";
import { normalizeMargins } from "./margin";
import { measurementToPixels } from "./measurements";
import { printRequestValidator } from "./validators";

import deepMerge = require("lodash/merge");

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getPdf(@Res() res: Response, @Query() params: PrintRequest): Promise<void> {
    params.margins = normalizeMargins(params.margins);
    const paramsValidated = printRequestValidator(params).unwrap();
    const options = mergePresets(paramsValidated);

    // Initialize PDF Output Options
    const pdfOptions: PDFOptions = {};
    pdfOptions.margin = options.margins as typeof pdfOptions.margin;
    if (options.scale != null) {
      pdfOptions.scale = options.scale;
    }
    if (options.printBackground != null) {
      pdfOptions.printBackground = options.printBackground;
    }
    if (options.landscape != null) {
      pdfOptions.landscape = options.landscape;
    }
    if (options.pageRanges != null) {
      pdfOptions.pageRanges = options.pageRanges;
    }
    if (options.format != null) {
      pdfOptions.format = options.format;
    }
    if (options.width != null) {
      pdfOptions.width = options.width;
    }
    if (options.height != null) {
      pdfOptions.height = options.height;
    }
    if (options.preferCSSPageSize != null) {
      pdfOptions.preferCSSPageSize = options.preferCSSPageSize;
    }

    if (!params.html && !params.url) {
      throw new HttpException('"url" or "html" must be specified', HttpStatus.BAD_REQUEST);
    }

    const printService = await this.appService.getPrintService();
    const pdfBuffer = await printService.usePage(async page => {
      // Emulate Print
      await page.emulateMedia("print");

      // Set View Port to match Page Format minus margins
      const format = appConfig.formats[options.format || "Letter"];
      const viewportWidth = Math.floor(
        measurementToPixels(options.width != null ? options.width : format![0])! -
          measurementToPixels(options.margins!.left != null ? options.margins!.left : 0) -
          measurementToPixels(options.margins!.right != null ? options.margins!.right : 0),
      );
      const viewportHeight = Math.floor(
        measurementToPixels(options.height != null ? options.height : format![1])! -
          measurementToPixels(options.margins!.top != null ? options.margins!.top : 0) -
          measurementToPixels(options.margins!.bottom != null ? options.margins!.bottom : 0),
      );
      await page.setViewport({ width: viewportWidth, height: viewportHeight });

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
      const { html: headerHtml, extracted: headerExtracted, adjustedMargin: topAdjustedMargin } = await determineHeaderFooterHtml(
        page,
        true,
        options.header,
        options.margins,
      );
      const { html: footerHtml, extracted: footerExtracted, adjustedMargin: bottomAdjustedMargin } = await determineHeaderFooterHtml(
        page,
        false,
        options.footer,
        options.margins,
      );

      // Determine if we should show the header and footer
      pdfOptions.displayHeaderFooter = !!(headerHtml || footerHtml);

      // Apply Header and Footer Html
      if (pdfOptions.displayHeaderFooter) {
        let extractedStyleCss: string = "";
        if (headerExtracted || footerExtracted) {
          const extractedStyleTags = await tryExtractHtmlOfMany(page, "style");
          extractedStyleCss = extractedStyleTags.join("\n");
        }

        if (headerHtml) {
          pdfOptions.headerTemplate = appConfig.headerFooterCssResetHtml + (headerExtracted ? extractedStyleCss + headerHtml : headerHtml);
          if (topAdjustedMargin) {
            if (options.margins!.top) {
              pdfOptions.margin!.top = `${measurementToPixels(topAdjustedMargin) + measurementToPixels(options.margins!.top)}px`;
            } else {
              pdfOptions.margin!.top = topAdjustedMargin;
            }
          }
        }

        if (footerHtml) {
          pdfOptions.footerTemplate = appConfig.headerFooterCssResetHtml + (footerExtracted ? extractedStyleCss + footerHtml : footerHtml);
          if (bottomAdjustedMargin) {
            if (options.margins!.bottom) {
              pdfOptions.margin!.bottom = `${measurementToPixels(bottomAdjustedMargin) + measurementToPixels(options.margins!.bottom)}px`;
            } else {
              pdfOptions.margin!.bottom = bottomAdjustedMargin;
            }
          }
        }
      }

      // Blur the activeElement to prevent cursor in text box
      await blurActiveElement(page);
      return page.pdf(pdfOptions);
    });

    res.status(200);
    res.contentType("application/pdf");
    res.set({ "Content-Length": pdfBuffer.length });
    res.send(pdfBuffer);
  }
}

async function determineHeaderFooterHtml(
  page: Page,
  isHeader: boolean,
  headerFooterOptions: HeaderFooterOptions | null | undefined,
  margins: MarginsNormalized | null | undefined,
): Promise<{ html: string | null; extracted: boolean; adjustedMargin?: string | null }> {
  if (!headerFooterOptions) {
    return { html: null, extracted: false };
  }

  const { html: defaultHtml, htmlHeight: defaultHtmlHeight, scalingFudge, selector } = headerFooterOptions;

  let html: string | null | undefined = null;
  let extracted = false;
  let adjustedMargin: string | null = null;
  if (selector) {
    const hh = await tryMeasureAndExtractHtmlAndRemove(page, selector, false);
    if (hh) {
      html = hh.html;
      adjustedMargin = hh.height + "px";
      extracted = true;
    }
  } else {
    html = defaultHtml;
    if (html && defaultHtmlHeight) {
      adjustedMargin = defaultHtmlHeight;
    }
  }

  if (html) {
    const wrapperCss = [
      "position: absolute",
      "box-sizing: border-box",
      `width: 100%`,
      `transform-origin: ${isHeader ? "top" : "bottom"} left;`,
      `transform: scale(${scalingFudge == null ? 1 : scalingFudge})`,
    ];
    if (margins != null) {
      if (margins.left) {
        wrapperCss.push(`padding-left: ${margins.left}`);
      }
      if (margins.right) {
        wrapperCss.push(`padding-right: ${margins.right}`);
      }
      if (isHeader && margins.top) {
        wrapperCss.push(`padding-top: ${margins.top}`);
      }
      if (!isHeader && margins.bottom) {
        wrapperCss.push(`padding-bottom: ${margins.bottom}`);
      }
    }
    if (headerFooterOptions.wrapperStyle) {
      wrapperCss.push(headerFooterOptions.wrapperStyle);
    }
    html = `<div class="html-pdf-press-header-footer-wrapper" style="${wrapperCss.join("; ")}">${html}</div>`;
  } else {
    html = null;
  }
  return { html, extracted, adjustedMargin };
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
