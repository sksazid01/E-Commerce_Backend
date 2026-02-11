import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER')
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  async getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addToCart(
    @CurrentUser() user: any,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(user.id, addToCartDto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeFromCart(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(user.id, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}
