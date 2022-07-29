import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function MatchesOtherProperty(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchesOtherPropertyConstraint,
    });
  };
}

/**
 * Checks whether a string property matches another property on the same object.
 *
 * Based on https://stackoverflow.com/a/60954034
 */
@ValidatorConstraint({ name: 'MatchOtherField' })
export class MatchesOtherPropertyConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} must match ${validationArguments.constraints[0]}`;
  }
}
