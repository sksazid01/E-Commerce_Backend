import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const MAX_CANCELLED_ORDERS = 3;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async placeOrder(userId: string) {
    // Check if user is blocked
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.isBlocked) {
      throw new ForbiddenException(
        'Your account has been blocked due to excessive order cancellations',
      );
    }

    // Get cart with items
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock availability
    for (const item of cart.cartItems) {
      if (item.product.stock < item.quantity) {
        throw new ConflictException(
          `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`,
        );
      }
    }

    // Calculate total
    const totalAmount = cart.cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    // Use transaction to ensure data consistency
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING',
        },
      });

      // Create order items and update stock
      for (const item of cart.cartItems) {
        // Create order item with price locked at purchase time
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          },
        });

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Fetch complete order details
    const completeOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      success: true,
      data: completeOrder,
      message: 'Order placed successfully',
    };
  }

  async getUserOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: orders,
      count: orders.length,
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      data: order,
    };
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === 'DELIVERED') {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    if (order.status === 'SHIPPED') {
      throw new BadRequestException(
        'Cannot cancel shipped order. Please contact support.',
      );
    }

    // Use transaction to restore stock and update order
    await this.prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      // Restore stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Increment cancelled orders count
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          cancelledOrdersCount: {
            increment: 1,
          },
        },
      });

      // Block user if exceeded cancellation limit
      if (user.cancelledOrdersCount >= MAX_CANCELLED_ORDERS && !user.isBlocked) {
        await tx.user.update({
          where: { id: userId },
          data: { isBlocked: true },
        });
      }
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    let warningMessage = '';
    if (user.cancelledOrdersCount >= MAX_CANCELLED_ORDERS) {
      warningMessage =
        ' Your account has been blocked due to excessive cancellations.';
    } else if (user.cancelledOrdersCount === MAX_CANCELLED_ORDERS - 1) {
      warningMessage = ` Warning: One more cancellation will block your account.`;
    }

    return {
      success: true,
      message: `Order cancelled successfully.${warningMessage}`,
      data: {
        cancelledOrdersCount: user.cancelledOrdersCount,
        isBlocked: user.isBlocked,
      },
    };
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    return {
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
    };
  }
}
