import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Place order from cart' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  @ApiResponse({ status: 400, description: 'Cart is empty' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  async placeOrder(@CurrentUser() user: any) {
    return this.ordersService.placeOrder(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getUserOrders(@CurrentUser() user: any) {
    return this.ordersService.getUserOrders(user.id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'All orders retrieved successfully' })
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@CurrentUser() user: any, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(user.id, orderId);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelOrder(@CurrentUser() user: any, @Param('id') orderId: string) {
    return this.ordersService.cancelOrder(user.id, orderId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      updateOrderStatusDto.status,
    );
  }

  @Post(':id/pay')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Simulate payment for an order' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be paid' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async simulatePayment(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
  ) {
    return this.ordersService.simulatePayment(user.id, orderId);
  }
}
