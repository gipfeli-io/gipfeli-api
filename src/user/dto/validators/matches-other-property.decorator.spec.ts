import { validate } from 'class-validator';
import { MatchesOtherProperty } from './matches-other-property.decorator';

class TestObject {
  testMatch: string;
  @MatchesOtherProperty('testMatch')
  testProperty: string;
}

describe('MatchesOtherField Decorator', () => {
  let testObject: TestObject;

  beforeEach(() => (testObject = new TestObject()));

  it('marks matching strings as valid', async () => {
    testObject.testMatch = 'test';
    testObject.testProperty = testObject.testMatch;

    const errors = await validate(testObject);
    expect(errors.length).toBe(0);
  });

  it('marks non-matching strings as invalid', async () => {
    testObject.testMatch = 'test';
    testObject.testProperty = 'no-match';

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });
});
