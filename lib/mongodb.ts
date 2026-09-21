import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';

if (!uri) {
  console.warn('MONGODB_URI is not set. API routes will fail without it.');
}

type MongoClientCache = {
  client: MongoClient;
  promise: Promise<MongoClient>;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClientCache | undefined;
}

let cachedClient = global._mongoClient;

if (!cachedClient) {
  const client = new MongoClient(uri);
  cachedClient = { client, promise: client.connect() };
  global._mongoClient = cachedClient;
}

export default async function getClient(): Promise<MongoClient> {
  const { client, promise } = cachedClient;
  await promise;
  return client;
}
