import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('FieldOps-API');
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Serve static upload directory for job photos, signatures, and invoices
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('FieldOps ERP - UAE API Documentation')
    .setDescription(
      'REST API for UAE Field-Service, Maintenance, Manpower Supply, and Equipment Rental ERP. Includes UAE 5% VAT calculations, TRN compliance, and PostGIS geospatial routing.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`FieldOps ERP API running on http://localhost:${port}`);
  logger.log(`Swagger OpenAPI Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
