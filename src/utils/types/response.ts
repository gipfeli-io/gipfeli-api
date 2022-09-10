import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { HttpStatus } from '@nestjs/common';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class ValidationError {
  @ApiProperty({
    description: 'Property name that has error(s).',
    example: 'lastName',
  })
  @IsNotEmpty()
  @IsString()
  property: string;

  @ApiProperty({
    description: 'Contains a list of validation errors for the property.',
    example: ['lastName should not be empty', 'lastName must be a string'],
    minItems: 1,
  })
  @IsArray()
  @Min(1)
  errors: string[];
}

export class GenericStatusResponseWithContent {
  @ApiProperty({
    example: HttpStatus.BAD_REQUEST,
    type: 'number',
  })
  @IsNumber()
  statusCode = 400;

  @ApiProperty({
    description:
      'Either contains a single error message or a set of validation errors.',
    oneOf: [
      {
        type: 'array',
        minItems: 1,
        example: {
          errors: ['lastName should not be empty', 'lastName must be a string'],
          property: 'lastName',
        },
        items: { $ref: getSchemaPath(ValidationError) },
      },
      { type: 'string', example: 'Not found.' },
    ],
  })
  @IsNotEmpty()
  message: string | ValidationError[];

  @ApiProperty({
    description:
      'If message contains validation errors, the actual error is placed in this property instead of message.',
    required: false,
    example: 'Bad request.',
  })
  @IsString()
  @IsOptional()
  error?: string;
}
