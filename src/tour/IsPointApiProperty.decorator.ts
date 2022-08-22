import { ApiPropertyOptions } from '@nestjs/swagger';
import { createApiPropertyDecorator } from '@nestjs/swagger/dist/decorators/api-property.decorator';

/**
 * Since we are using the GeoJSON Point interface as a typehint, nestjs/swagger
 * is not able to pick up the type. To reduce code duplication, this custom
 * decorator create the @ApiProperty() decorator with the correct typing.
 *
 * It takes a description and, as a convenience, adds the GeoJSON type, which
 * currently is Point.
 */
const IsPointApiPropertyDecorator = (
  description: string,
): PropertyDecorator => {
  const options: ApiPropertyOptions = {
    type: 'object',
    description: `${description} (GeoJSON Point)`,
    properties: {
      type: { type: 'string', example: 'Point' },
      coordinates: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: { type: 'number' },
        example: [47.801, 42.23],
      },
    },
  };

  return createApiPropertyDecorator(options);
};

export default IsPointApiPropertyDecorator;
