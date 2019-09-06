import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { TypesmithValidationError } from "typesmith";

@Catch(TypesmithValidationError)
export class TypesmithExceptionFilter implements ExceptionFilter {
  catch(exception: TypesmithValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_REQUEST).json({ validationErrors: exception.errors });
  }
}
