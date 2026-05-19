import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const shouldUseSSL = process.env.DB_SSL === 'true';
const sslOptions = shouldUseSSL
  ? {
      rejectUnauthorized: false,
    }
  : false;

const isJsBuild = __filename.endsWith('.js');
const entitiesGlob = path.join(
  __dirname,
  'entities',
  '*.entity.' + (isJsBuild ? 'js' : 'ts'),
);
const migrationsGlob = path.join(
  __dirname,
  'migrations',
  '*.' + (isJsBuild ? 'js' : 'ts'),
);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wallet_transaction',
  entities: [entitiesGlob],
  migrations: [migrationsGlob],
  ssl: sslOptions,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
