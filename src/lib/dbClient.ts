import mongoose from 'mongoose';
import { initMongoConnection } from './mongoose';

async function getNativeMongoClient() {
  await initMongoConnection();
  return mongoose.connection.getClient();
}

const clientPromise = getNativeMongoClient();

export default clientPromise;
