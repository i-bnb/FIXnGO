import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async getRequests(query?: { status?: string; requestType?: string; approverUserId?: string }) {
    const where: any = { deletedAt: null };
    if (query?.status) where.status = query.status;
    if (query?.requestType) where.requestType = query.requestType;
    if (query?.approverUserId) where.approverUserId = query.approverUserId;

    return this.prisma.approvalRequest.findMany({
      where,
      include: {
        requestedBy: {
          select: { id: true, fullName: true, email: true },
        },
        approverUser: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRequestById(id: string) {
    const req = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        requestedBy: {
          select: { id: true, fullName: true, email: true },
        },
        approverUser: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
    if (!req) throw new NotFoundException(`Approval request ${id} not found`);
    return req;
  }

  async createRequest(
    input: {
      requestType: string;
      entityId: string;
      approverRole?: string;
      approverUserId?: string;
      comments?: string;
    },
    requestedById: string,
  ) {
    return this.prisma.approvalRequest.create({
      data: {
        requestType: input.requestType,
        entityId: input.entityId,
        requestedById,
        approverRole: input.approverRole || 'OPERATIONS_MANAGER',
        approverUserId: input.approverUserId || null,
        comments: input.comments,
        status: 'PENDING',
      },
      include: {
        requestedBy: true,
      },
    });
  }

  async approveRequest(id: string, comments?: string, actorUserId?: string) {
    const req = await this.getRequestById(id);
    if (req.status !== 'PENDING') {
      throw new BadRequestException(`Approval request is already ${req.status}`);
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approverUserId: actorUserId || req.approverUserId,
        comments: comments ? `${req.comments || ''}\nApproved notes: ${comments}`.trim() : req.comments,
      },
    });

    // Cascading updates for supported entity types
    if (req.requestType === 'QUOTATION_DISCOUNT') {
      await this.prisma.quotation.update({
        where: { id: req.entityId },
        data: { status: 'APPROVED' },
      }).catch(() => null);
    } else if (req.requestType === 'PURCHASE_ORDER') {
      await this.prisma.purchaseOrder.update({
        where: { id: req.entityId },
        data: { status: 'APPROVED' },
      }).catch(() => null);
    } else if (req.requestType === 'EXPENSE_CLAIM') {
      await this.prisma.expenseClaim.update({
        where: { id: req.entityId },
        data: { status: 'APPROVED', approvedById: actorUserId || null },
      }).catch(() => null);
    }

    return updated;
  }

  async rejectRequest(id: string, comments?: string, actorUserId?: string) {
    const req = await this.getRequestById(id);
    if (req.status !== 'PENDING') {
      throw new BadRequestException(`Approval request is already ${req.status}`);
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approverUserId: actorUserId || req.approverUserId,
        comments: comments ? `${req.comments || ''}\nRejection notes: ${comments}`.trim() : req.comments,
      },
    });

    if (req.requestType === 'QUOTATION_DISCOUNT') {
      await this.prisma.quotation.update({
        where: { id: req.entityId },
        data: { status: 'REJECTED' },
      }).catch(() => null);
    } else if (req.requestType === 'EXPENSE_CLAIM') {
      await this.prisma.expenseClaim.update({
        where: { id: req.entityId },
        data: { status: 'REJECTED' },
      }).catch(() => null);
    }

    return updated;
  }
}
