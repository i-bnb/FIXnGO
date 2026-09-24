import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Generate or extract consistent request correlation ID
    const requestId =
      (request.headers['x-request-id'] as string) ||
      (request.headers['x-correlation-id'] as string) ||
      randomUUID();

    response.setHeader('X-Request-ID', requestId);

    // 2. Determine HTTP Status code
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected internal server error occurred.';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        errorType = (res as any).error || errorType;
      }
    } else if (exception instanceof Error) {
      // In non-production, display technical error message; in production, sanitize
      const isProduction = process.env.NODE_ENV === 'production';
      message = isProduction
        ? 'Internal server error. Please quote the requestId to support.'
        : exception.message;
      errorType = exception.name;
    }

    // 3. Log technical error with full stack trace on server
    this.logger.error(
      `[${requestId}] ${request.method} ${request.url} - Status ${status} - Error: ${
        exception instanceof Error ? exception.message : JSON.stringify(exception)
      }`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // 4. Return clean, sanitized JSON response (zero stack trace / schema leakage)
    response.status(status).json({
      statusCode: status,
      error: errorType,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
