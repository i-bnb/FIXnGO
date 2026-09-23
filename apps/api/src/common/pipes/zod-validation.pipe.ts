import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (!this.schema) {
      return value;
    }

    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new BadRequestException(`Validation failed: ${messages}`);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
