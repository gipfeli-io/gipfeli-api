import { ConnectionOptions, createConnection, getManager } from 'typeorm';
import { User, UserRole } from '../src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as yargs from 'yargs';
import * as inquirer from 'inquirer';
import * as dotenv from 'dotenv';

/**
 * This quick and dirty script file allows for easily adding a new user to the
 * database with the correct hashes applied. We're using only dependencies that
 * are already part of nest (inquirer, yargs, dotenv). Currently, nest does not
 * have a possibility to add custom commands, but we do not want to include
 * another set of dependencies that hijacks nest (e.g. nestjs-cli).
 */

dotenv.config();
const rootDir = process.env.NODE_ENV ? 'dist/' : './';

const databaseConfig: ConnectionOptions = {
  type: 'postgres',
  database: process.env.TYPEORM_DATABASE,
  port: parseInt(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  host: process.env.TYPEORM_HOST,
  entities: [rootDir + '**/*.entity{.ts,.js}'],
};

const createUser = async () => {
  const answers = await inquirer.prompt([
    {
      message: 'Email?',
      name: 'email',
      type: 'string',
    },
    {
      message: 'First name?',
      name: 'firstname',
      type: 'string',
    },
    {
      message: 'Last name?',
      name: 'lastname',
      type: 'string',
    },
    {
      message: 'Password?',
      name: 'password',
      type: 'password',
    },
    {
      message: 'Is admin?',
      name: 'admin',
      type: 'confirm',
      default: false
    },
    {
      message: 'Is active?',
      name: 'active',
      type: 'confirm',
      default: true
    }
  ]);

  const connection = await createConnection(databaseConfig);
  const manager = getManager();

  const newUser = new User();
  newUser.email = answers.email;
  newUser.firstName = answers.firstname;
  newUser.lastName = answers.lastname;
  newUser.password = bcrypt.hashSync(answers.password, 10);
  newUser.isActive = answers.active;
  newUser.role = answers.admin ? UserRole.ADMINISTRATOR : UserRole.USER;

  await manager.save(newUser);
  console.log('Saved new user!');
  await connection.close();
};

const argv = yargs(process.argv.splice(2))
  .command('create', 'Create a new user (interactively)', {}, createUser)
  .demandCommand(1, 1, 'choose a command')
  .strict()
  .help('h').argv;
