import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { validateEnv } from './common/config/env.validation';
import { parseCorsOrigins, isOriginAllowed } from './common/utils/cors.util';

// Load environment files before bootstrap
function loadEnv(filePaths: string[]) {
  for (const fp of filePaths) {
    try {
      if (fs.existsSync(fp)) {
        const lines = fs.readFileSync(fp, 'utf-8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key] || process.env[key] === '') {
              process.env[key] = val;
            }
          }
        }
      }
    } catch {
      // Quietly ignore file read errors
    }
  }
}

loadEnv([
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(process.cwd(), '../.env'),
]);

async function bootstrap() {
  const logger = new Logger('FieldOps-API');

  // 1. Strict Fail-Fast Environment Validation on Startup
  try {
    validateEnv();
    logger.log('Environment configuration validated successfully.');
  } catch (err: any) {
    logger.error(`Startup halted: ${err.message}`);
    process.exit(1);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Dynamic CORS Configuration (CORS_ORIGINS + Vercel preview domains)
  const allowedOrigins = parseCorsOrigins(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN);

  app.enableCors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    // Use Authorization Bearer tokens, not cross-site cookies
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-demo-role'],
  });

  // 3. Serve local fallback upload directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  // 4. OpenAPI Swagger Documentation
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

  // 5. Listen on process.env.PORT and 0.0.0.0
  const port = parseInt(process.env.PORT || '4000', 10);
  await app.listen(port, '0.0.0.0');

  logger.log(`FieldOps ERP API running on http://0.0.0.0:${port}`);
  logger.log(`Health check probe active at http://0.0.0.0:${port}/api/health`);
  logger.log(`Swagger OpenAPI Documentation available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
