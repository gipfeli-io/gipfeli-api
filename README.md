# Gipfeli.io API

![CI](https://github.com/gipfeli-io/gipfeli-api/actions/workflows/deployment.yml/badge.svg?branch=stage)

## Description

This repository contains the backend for gipfeli.io and is implemented using [Nest](https://github.com/nestjs/nest). See
below description on how to install and run the gipfeli.io backend.

## Prerequisites

Before you can run the TypeORM migrations you will need to setup a postgres database and install the PostGIS extension.
Please check out the documentation for more details on how to do
this: [Gipfeli.io Documentation](https://docs.gipfeli.io/docs/setup#backend).

## Installation

After setting up the database please do the following steps:

- Clone the repository
- Create an `.env` file based on the `.env.example` and adjust the values
- Run the commands below:

```bash
# install dependencies
$ npm i 

# execute typeorm migrations to initialize database
$ npm run typeorm-migration

# create a user interactively
$ npm run create-user
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

### Unit tests

Unit tests should not rely on any third party services and are mocked accordingly. No database connection is required.

```bash
# unit tests
$ npm run test

# with coverage
$ npm run test:cov
```

### e2e tests

These tests require an existing database. You can create a `.env.testing` file and specify configuration values that you
want to override from your normal `.env` file, most notably the database name. Notice that both env files are loaded,
which allows you to not define configuration values multiple times - you just override those that differ from your
development environment.

```bash
# e2e tests
$ npm run test:e2e

# with coverage
$npm run test:e2e:cov
```

#### Merging coverage

Both test types create their own directory in the `./coverage` folder. If you need the combined JSON output as if it was
one test run, move both JSON outputs from their directory to the `./coverage` folder and run the following commands:

```bash
# merge the files
$ npm run coverage:merge

# generate the merged .lcov file
$npm run coverage:generate
```

This is also used in our pipeline so SonarCloud gets the full coverage report from both test runs. See the CI file for
how it's done there.

## Working with Swagger documentation

We are using the official [nest integration](https://docs.nestjs.com/openapi/introduction) for our documentation. The
documentation can be found by accessing `/api`. It is generated on the fly and we're also
using [the nest CLI option](https://docs.nestjs.com/openapi/cli-plugin) to avoid a lot of boilerplate. For this to work,
some things have to be kept in mind when developing:

* DTOs must **always** be in a file ending in `.dto.ts`. If this is done, they will be automatically inspected and added
  to the docs.
* Sometimes, the docs are not updated. If that happens, run `rimraf dist` and force nest to build the whole directory
  from scratch.
* Parameter inspection does not work - use `@ApiParam()` for that.
* Add comments to add more information. They are inspected automatically and add more depth to the documentation. You
  can also use things link `@example` which are then used in the API documentation as well.