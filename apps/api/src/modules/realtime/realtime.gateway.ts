import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:work_order')
  handleJoinWorkOrder(@ConnectedSocket() client: Socket, @MessageBody() data: { workOrderId: string }) {
    const room = `work_order_${data.workOrderId}`;
    client.join(room);
    this.logger.log(`Socket ${client.id} joined ${room}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage('join:fleet')
  handleJoinFleet(@ConnectedSocket() client: Socket) {
    client.join('admin_fleet');
    this.logger.log(`Socket ${client.id} joined admin_fleet`);
    return { status: 'joined', room: 'admin_fleet' };
  }

  // Backwards compatibility subscriptions
  @SubscribeMessage('join:job')
  handleJoinJobLegacy(@ConnectedSocket() client: Socket, @MessageBody() data: { jobId: string }) {
    client.join(`work_order_${data.jobId}`);
    return { status: 'joined', room: `work_order_${data.jobId}` };
  }

  @SubscribeMessage('join:dispatch')
  handleJoinDispatchLegacy(@ConnectedSocket() client: Socket) {
    client.join('admin_fleet');
    return { status: 'joined', room: 'admin_fleet' };
  }

  emitWorkOrderStatusChanged(workOrderId: string, newStatus: string, payload?: any) {
    const eventData = {
      workOrderId,
      status: newStatus,
      timestamp: new Date().toISOString(),
      ...payload,
    };
    if (this.server) {
      this.server.to(`work_order_${workOrderId}`).emit('work_order_status_changed', eventData);
      this.server.to('admin_fleet').emit('work_order_status_changed', eventData);
      // Legacy emit
      this.server.to(`job:${workOrderId}`).emit('job:status:changed', eventData);
      this.server.to('admin:dispatch').emit('job:status:changed', eventData);
    }
  }

  emitTechnicianLocation(payload: {
    employeeId: string;
    employeeName?: string;
    latitude: number;
    longitude: number;
    speedKmh?: number;
    headingDegrees?: number;
    recordedAt?: Date | string;
    workOrderId?: string;
  }) {
    if (this.server) {
      this.server.to('admin_fleet').emit('technician_location_update', payload);
      this.server.to('admin:dispatch').emit('tech:location:changed', payload);
      if (payload.workOrderId) {
        this.server.to(`work_order_${payload.workOrderId}`).emit('technician_location_update', payload);
        this.server.to(`job:${payload.workOrderId}`).emit('tech:location:changed', payload);
      }
    }
  }

  emitFleetAlert(alert: { type: string; title: string; message: string; timestamp?: string; [key: string]: any }) {
    if (this.server) {
      this.server.to('admin_fleet').emit('fleet_alert', alert);
    }
  }

  emitNotification(payload: {
    recipientRole?: string;
    recipientName?: string;
    title: string;
    message: string;
    channel?: string;
    category?: string;
    timestamp?: string;
  }) {
    if (this.server) {
      const data = {
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      };
      this.server.emit('in_app_notification', data);
      this.server.to('admin_fleet').emit('in_app_notification', data);
    }
  }
}
