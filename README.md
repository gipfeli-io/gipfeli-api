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

Create a `.env.testing` file which will be used to run the tests. This will override anything from the normal .env file.

```bash
# unit tests
$ npm run test
```

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