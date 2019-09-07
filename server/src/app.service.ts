import { Injectable } from "@nestjs/common";
import * as puppeteer from "puppeteer";
import { appConfig } from "./app-config";
import { PrintService } from "./print.service";

import Browser = puppeteer.Browser;

@Injectable()
export class AppService {
  private browserPromise?: Promise<Browser>;
  private printServicePromise?: Promise<PrintService>;

  constructor() {
    if (!appConfig.chrome.initialilzeOnFirstRequest) {
      void this.getPrintService();
    }
  }

  async launchBrowser() {
    const args: string[] = [];
    const { chrome } = appConfig;

    if (chrome.noSandbox) {
      args.push("--no-sandbox");
    }
    if (chrome.disableGpu) {
      args.push("--disable-gpu");
    }

    const options: puppeteer.LaunchOptions = {
      args,
      headless: chrome.headless,
    };

    if (!chrome.useChromium) {
      options.executablePath = chrome.bin;
    }

    const browser = await puppeteer.launch(options);

    // browser.on("error", msg => {
    //   console.log("BROWSER ERROR", msg);
    //   throw msg;
    // });

    console.log("Launched Chrome Browser version ", await browser.version());
    return browser;
  }

  async getBrowser(): Promise<Browser> {
    if (this.browserPromise == null) {
      this.browserPromise = this.launchBrowser();
    }
    return this.browserPromise;
  }

  async getPrintService(): Promise<PrintService> {
    if (this.printServicePromise == null) {
      this.printServicePromise = this.getBrowser().then(
        browser =>
          new PrintService({
            browser,
            useIncognito: appConfig.chrome.useIncognito,
            closePages: appConfig.chrome.closePages,
            concurrentPages: appConfig.chrome.concurrentPages,
          }),
      );
    }
    return this.printServicePromise;
  }
}
