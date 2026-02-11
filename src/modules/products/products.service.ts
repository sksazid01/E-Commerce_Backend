import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const take = limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count(),
    ]);

    return {
      success: true,
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      data: product,
    };
  }

  async create(createProductDto: CreateProductDto) {
    const { name, description, price, stock, imageUrl } = createProductDto;

    if (stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    const product = await this.prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
      },
    });

    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findById(id); // Check if product exists

    if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
      throw new BadRequestException('Stock cannot be negative');
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    return {
      success: true,
      data: product,
      message: 'Product updated successfully',
    };
  }

  async delete(id: string) {
    await this.findById(id); // Check if product exists

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}
