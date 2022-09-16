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
   * For the next tests, we check for the boundary lat/lon values to ensure our
   * decorator uses the right coordinates in its check.
   */
  it('marks point at extreme postive lat as valid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [0.0, 90.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(0);
  });

  it('marks point at extreme negative lat as valid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [0.0, -90.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(0);
  });

  it('marks point at extreme postive lon as valid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [180.0, 0.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(0);
  });

  it('marks point at extreme negative lon as valid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [-180.0, 0.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(0);
  });

  it('marks a GeoJSON point with minimum positive invalid latitude as invalid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [0.0, 90.001],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('marks a GeoJSON point with minimum negative invalid latitude as invalid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [0.0, -90.001],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('marks a GeoJSON point with minimum positive invalid longitude as invalid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [180.001, 0.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('marks a GeoJSON point with minimum negative invalid longitude as invalid', async () => {
    testObject.testProperty = {
      type: 'Point',
      coordinates: [-180.001, 0.0],
    };

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });
});
