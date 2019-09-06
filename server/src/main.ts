import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { TypesmithExceptionFilter } from "./typesmith-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new TypesmithExceptionFilter());
  await app.listen(7355);
}
bootstrap();
