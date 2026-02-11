import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @ApiProperty({ example: 'product-uuid-here' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;
}
