import {
  isLatitude,
  isLongitude,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Point } from 'geojson';

@ValidatorConstraint({ async: true })
class IsPointConstraint implements ValidatorConstraintInterface {
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} must be a valid GeoJSON object of type "Point".`;
  }

  validate(point: Point) {
    if (
      point == undefined ||
      point.type === undefined ||
      point.type !== 'Point' ||
      point.coordinates === undefined ||
      !Array.isArray(point.coordinates) ||
      point.coordinates.length !== 2
    ) {
      return false;
    }

    // GeoJSON coordinates are in the format of Lon/Lat
    return (
      isLongitude(point.coordinates[0].toString()) &&
      isLatitude(point.coordinates[1].toString())
    );
  }
}

/**
 * Check if the property is a valid GeoJSON Point object
 * @param validationOptions
 * @constructor
 */
export function IsPoint(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPointConstraint,
    });
  };
}
