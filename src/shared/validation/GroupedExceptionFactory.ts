import { BadRequestException, ValidationError } from '@nestjs/common';

const GroupedExceptionFactory = (errors: ValidationError[]) => {
  const messages = errors.map((value) => ({
    errors: value.constraints ? Object.values(value.constraints) : [],
    property: value.property,
    value: value.value,
  }));

  return new BadRequestException(messages);
};

export default GroupedExceptionFactory;
