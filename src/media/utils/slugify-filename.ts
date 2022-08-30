import slugify from 'slugify';

const slugifyOptions = { lower: true, strict: true };
/**
 * Returns a slugified filename. If it has an extension, it slugifies only the
 * actual filename and appends the extension; if not, it slugifies the whole
 * filename.
 *
 * Note that we treat the last element after a dot as extension - this does not
 * have to mean that it is a valid extension. E.g. "filename.wrongextension"
 * will be slugified to "filename.wrongextension" because that's what we assume
 * is the file extension.
 *
 * @param filename
 */
export function slugifyFilename(filename: string) {
  const splitFilename = filename.split('.');

  if (splitFilename.length === 1) {
    return slugify(filename, slugifyOptions);
  } else {
    const extension = splitFilename.pop();

    const slugifiedFilename = slugify(splitFilename.join(), slugifyOptions);

    return `${slugifiedFilename}.${extension}`;
  }
}
