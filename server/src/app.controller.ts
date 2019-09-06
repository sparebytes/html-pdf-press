import { Controller, Get, Res, Query, HttpException, HttpStatus } from "@nestjs/common";
import { AppService } from "./app.service";
import { Response } from "express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getPdf(@Res() res: Response, @Query("url") url: string): Promise<void> {
    if (!url) {
      throw new HttpException('"url" param is missing', HttpStatus.BAD_REQUEST);
    }

    const printService = await this.appService.getPrintService();
    const pdfBuffer = await printService.usePage(async page => {
      await page.goto(url, {
        // timeout: loadTimeout,
        waitUntil: ["load", "domcontentloaded"],
      });
      return await page.pdf();
    });

    res.status(200);
    res.contentType("application/pdf");
    res.set({ "Content-Length": pdfBuffer.length });
    res.send(pdfBuffer);
  }
}
