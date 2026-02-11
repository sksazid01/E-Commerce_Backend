import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({ example: 'Laptop', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'High-performance laptop', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 999.99, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock?: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
