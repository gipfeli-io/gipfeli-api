import { slugifyFilename } from './slugify-filename';

describe('slugify-filename', () => {
  it('returns a slugified filename with its extension', () => {
    const filename = 'testFileöäü.jpg';

    const slugified = slugifyFilename(filename);

    expect(slugified).toEqual('testfileoau.jpg');
  });

  it('returns a slugified filename with its extension if it has multiple dots', () => {
    const filename = 'testFileöäü.copy.test.jpg';

    const slugified = slugifyFilename(filename);

    expect(slugified).toEqual('testfileoaucopytest.jpg');
  });

  it('returns a slugified filename if it has no extension', () => {
    const filename = 'testFileöäü';

    const slugified = slugifyFilename(filename);

    expect(slugified).toEqual('testfileoau');
  });
});
