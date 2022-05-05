import { UserDummy } from './user-dummy';

xdescribe('UserDummy', () => {
  it('should be defined', () => {
    expect(new UserDummy()).toBeDefined();
  });
});
