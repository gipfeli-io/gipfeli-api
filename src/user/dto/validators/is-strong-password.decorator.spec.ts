import { validate } from 'class-validator';
import { IsStrongPassword } from './is-strong-password.decorator';

class TestObject {
  @IsStrongPassword()
  password: string;
}

describe('IsStrongPassword Decorator', () => {
  let testObject: TestObject;

  beforeEach(() => (testObject = new TestObject()));

  it('marks strong password as valid', async () => {
    testObject.password = 'Aa$aaaaa';

    const errors = await validate(testObject);
    expect(errors.length).toBe(0);
  });

  it('password with less than 8 chars is invalid', async () => {
    testObject.password = 'Aa$aaaa';

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('password without upper case letter is invalid', async () => {
    testObject.password = 'aa$aaaaa';

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('password without lower case letter is invalid', async () => {
    testObject.password = 'AA$AAAAA';

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });

  it('password without special chars is invalid', async () => {
    testObject.password = 'AAaAAAAA';

    const errors = await validate(testObject);
    expect(errors.length).toBe(1);
  });
});
