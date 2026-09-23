import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Files & Object Storage')
@Controller()
export class FilesController {
  constructor(private storageService: StorageService) {}

  @Post(['files/upload', 'api/files/upload'])
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Upload file (stream to Appwrite / local storage) and return file metadata + preview URL' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Multipart binary file' },
        base64: { type: 'string', description: 'Alternative base64 data URI string' },
        fileName: { type: 'string', example: 'site_photo_before.jpg' },
        bucket: { type: 'string', example: 'job-photos' },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: any,
    @Body() body: { base64?: string; fileName?: string; bucket?: string },
    @Req() req: any,
  ) {
    const bucket = body.bucket || 'job-photos';
    const userId = req.user?.id;

    if (file && file.buffer) {
      return this.storageService.uploadBuffer(
        file.buffer,
        file.originalname || body.fileName || 'upload.bin',
        file.mimetype || 'application/octet-stream',
        bucket,
        userId,
      );
    }

    if (body.base64) {
      return this.storageService.uploadBase64(
        body.base64,
        body.fileName || 'upload.jpg',
        bucket,
        userId,
      );
    }

    return {
      success: false,
      message: 'No file or base64 data provided in request',
    };
  }
}
