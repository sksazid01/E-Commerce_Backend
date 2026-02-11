import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'SHIPPED',
    enum: OrderStatusEnum,
    description: 'New order status',
  })
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;
}
