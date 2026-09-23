import { Controller, Get, Post, Patch, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { NotificationsService, SendNotificationDto } from './notifications.service';

@ApiTags('Notifications & Messaging')
@Controller('api/notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Get current user in-app notifications and unread count' })
  async getMyNotifications(@Req() req: any) {
    const userId = req.user?.id || 'demo-user-id';
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark an in-app notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'List bilingual EN/AR notification templates' })
  async getTemplates() {
    return this.notificationsService.getTemplates();
  }

  @Get('outbox')
  @ApiOperation({ summary: 'View simulated outbox (WhatsApp, SMS, Email, In-App logs) for Admin inspection' })
  async getOutbox(
    @Query('channel') channel?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getOutbox({
      channel,
      limit: limit ? parseInt(limit, 10) : 100,
    });
  }

  @Post('send')
  @ApiOperation({ summary: 'Send or simulate a notification via template or direct text' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recipientUserId: { type: 'string' },
        templateCode: { type: 'string', example: 'TECH_DISPATCHED' },
        channel: { type: 'string', example: 'WHATSAPP_SIMULATED' },
        title: { type: 'string' },
        message: { type: 'string' },
        metadata: { type: 'object' },
        language: { type: 'string', example: 'en' },
      },
      required: ['recipientUserId'],
    },
  })
  async sendNotification(@Body() body: SendNotificationDto) {
    return this.notificationsService.send(body);
  }
}
