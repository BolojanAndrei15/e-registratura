import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Încarcă variabilele de mediu din fișierul .env
dotenv.config();

export default defineConfig({
  schema: './lib/schema.js', // folosește schema.ts TypeScript
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
