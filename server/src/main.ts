import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(7355);
  console.log(`html-pdf-press: listening on http://127.0.0.1:7355`);
}
bootstrap();
