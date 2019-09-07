import { Browser, BrowserContext, Page } from "puppeteer";

export interface PrintServiceOptions {
  browser: Browser;
  useIncognito: boolean;
  concurrentPages: number;
}

class PageHandle {
  constructor(readonly page: Page, readonly browserContext: BrowserContext | null = null) {}
}

export class PrintService {
  private readonly awaitingPageHandleDefferds: { resolve: (v: any) => void; reject: (v: any) => void }[] = [];
  private readonly availablePageHandles: PageHandle[] = [];
  readonly browser: Browser;
  readonly useIncognito: boolean;
  readonly concurrentPages: number;
  constructor(options: PrintServiceOptions) {
    this.browser = options.browser;
    this.useIncognito = options.useIncognito;
    this.concurrentPages = options.concurrentPages;

    if (this.concurrentPages > 0) {
      for (let i = 0; i < this.concurrentPages; i++) {
        void this.readyNextPageHandle();
      }
    } else {
      throw new Error("concurrentPages must be greater than 0");
    }
  }

  async createPageHandle(): Promise<PageHandle> {
    let context: BrowserContext | null = null;
    let page: Page;
    if (this.useIncognito) {
      context = await this.browser.createIncognitoBrowserContext();
      page = await context.newPage();
    } else {
      page = await this.browser.newPage();
    }

    // page.on("error", msg => {
    //   throw msg;
    // });

    return new PageHandle(page, context);
  }

  private async readyNextPageHandle(): Promise<void> {
    const pageHandle = await this.createPageHandle();
    this.pushNextPageHandle(pageHandle);
  }

  private pushNextPageHandle(pageHandle: PageHandle) {
    const awaitingPageHandleDeferred = this.awaitingPageHandleDefferds.shift();
    if (awaitingPageHandleDeferred != null) {
      awaitingPageHandleDeferred.resolve(pageHandle);
    } else {
      this.availablePageHandles.push(pageHandle);
    }
  }

  async usePage<T>(callback: (pageHandle: Page) => Promise<T>): Promise<T> {
    let pageHandle = this.availablePageHandles.shift();

    if (pageHandle == null) {
      pageHandle = await new Promise<PageHandle>((resolve, reject) => this.awaitingPageHandleDefferds.push({ resolve, reject }));
    }

    const { page, browserContext } = pageHandle;

    try {
      const result = await callback(page);
      return result;
    } finally {
      if (browserContext) {
        browserContext.close();
        void this.readyNextPageHandle();
      } else {
        page.close();
        void this.readyNextPageHandle();
      }
    }
  }
}
