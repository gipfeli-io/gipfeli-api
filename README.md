# Gipfeli.io API

## Description

This repository contains the backend for gipfeli.io and is implemented using [Nest](https://github.com/nestjs/nest). See
below description on how to install and run the gipfeli.io backend.

## Installation

- Clone the repository
- Create an `.env` file based on the `.env.example` and adjust the values

Run the commands:

```bash
# install dependencies
$ npm i 

# execute typeorm migrations to initialize database
$ npm run typeorm-migration
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

```bash
# unit tests
$ npm run test
```

## Database

:::info You will need a postgres database to run the api. Please check out the documentation for more details:
[Gipfeli.io Documentation](https://docs.gipfeli.io/docs/setup#backend).
:::