import { IsPoint } from './is-point.decorator';
import { validate } from 'class-validator';

class TestObject {
  @IsPoint()
  testProperty: any;
}

describe('IsPoint Decorator', () => {
  let testObject: TestObject;

  beforeEach(() => (testObject = new TestObject()));

  it('marks a GeoJSON point as valid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [20.0, 7.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(0);
  });

  it('marks a GeoJSON point with wrong type as invalid', async () => {
    testObject.testProperty = {
      type: 'Line',
      coordinates: [20.0, 7.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('marks a string as invalid', async () => {
    testObject.testProperty = 'a';

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('marks an undefined as invalid', async () => {
    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('marks a GeoJSON point with missing coordinate as invalid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [20.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  /**
   * For the next two tests, we only check for one boundary value, since we're only interested in whether the
   * IsLatitude() or IsLongitude() check is invoked. The actual handling of boundary values should be tested
   * in these provided functions.
   */
  it('marks a GeoJSON point with invalid latitude as invalid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [90.001, 7.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('marks a GeoJSON point with invalid longitude as invalid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [20.0, 180.001],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });
});
