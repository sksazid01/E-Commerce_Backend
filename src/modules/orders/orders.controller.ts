import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
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
  async placeOrder(@CurrentUser() user: any) {
    return this.ordersService.placeOrder(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  async getUserOrders(@CurrentUser() user: any) {
    return this.ordersService.getUserOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrderById(@CurrentUser() user: any, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(user.id, orderId);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(@CurrentUser() user: any, @Param('id') orderId: string) {
    return this.ordersService.cancelOrder(user.id, orderId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Query('status') status: string,
  ) {
    return this.ordersService.updateOrderStatus(orderId, status);
  }
}
