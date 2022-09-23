import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const PASSWORD_STRENGTH =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[.*[!@#$%^&*()\-__+.]).{8,}$/;

@ValidatorConstraint({ async: true })
class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} must contain at least 1 upper and 1 lower case letter, must be at least 8 characters long and contain at least 1 special character.`;
  }

  validate(password: string, _args: ValidationArguments) {
    return PASSWORD_STRENGTH.test(password);
  }
}

/**
 * Check if the password is strong enough
 * @param validationOptions
 * @constructor
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
