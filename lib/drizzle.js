import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import '../drizzle/relations.js'; // importă relațiile generate

const queryClient = postgres(process.env.DATABASE_URL, { max: 1 });
export const db = drizzle(queryClient, { schema });
