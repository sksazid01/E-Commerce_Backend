import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Calculate cart total
    const total = cart.cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return {
      success: true,
      data: {
        cart,
        total: Number(total.toFixed(2)),
        itemCount: cart.cartItems.length,
      },
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    // Check if product exists and has sufficient stock
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new ConflictException(
        `Insufficient stock. Available: ${product.stock}`,
      );
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new ConflictException(
          `Cannot add ${quantity} more. Available: ${product.stock}, Already in cart: ${existingCartItem.quantity}`,
        );
      }

      cartItem = await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    } else {
      // Create new cart item
      cartItem = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
        include: { product: true },
      });
    }

    return {
      success: true,
      data: cartItem,
      message: 'Item added to cart successfully',
    };
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return {
      success: true,
      message: 'Item removed from cart successfully',
    };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      success: true,
      message: 'Cart cleared successfully',
    };
  }
}
