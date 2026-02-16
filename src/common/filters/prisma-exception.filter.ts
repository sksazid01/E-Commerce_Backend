import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';

    // Handle specific Prisma error codes
    switch (exception.code) {
      case 'P2002':
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        message = `A record with this ${target.join(', ')} already exists`;
        break;

      case 'P2025':
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;

      case 'P2003':
        // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference to related record';
        break;

      case 'P2014':
        // Invalid ID
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid ID provided';
        break;

      case 'P2011':
        // Null constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Required field is missing';
        break;

      case 'P2012':
        // Missing required value
        status = HttpStatus.BAD_REQUEST;
        message = 'Missing required value';
        break;

      case 'P2015':
        // Related record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Related record not found';
        break;

      case 'P2021':
        // Table does not exist
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database table not found';
        break;

      case 'P2022':
        // Column does not exist
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database column not found';
        break;

      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'An unexpected database error occurred';
        this.logger.error(
          `Unhandled Prisma Error Code: ${exception.code}`,
          exception.message,
        );
    }

    // Log the error
    this.logger.error(
      `Prisma Error ${exception.code}: ${message}`,
      exception.stack,
    );

    // Send standardized error response
    response.status(status).json({
      success: false,
      statusCode: status,
      error: 'Database Error',
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
