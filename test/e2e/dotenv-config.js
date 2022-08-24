// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

/**
 * We load the .env.testing file first, followed by the .env file. This way, any
 * variables missing in .env.testing but present in .env will be added, so we do
 * not have to re-configure everything.
 */
dotenv.config({ path: '.env.testing' });
dotenv.config({ path: '.env' });
