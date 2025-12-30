import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/models/user.model.js",        // your schema folder
  out: "./drizzle",       // migrations folder
  dialect: "postgresql",             // must be 'postgresql'
  dbCredentials: {
    host: process.env.DATABASE_HOST || "neon_local_dev",
    port: Number(process.env.DATABASE_PORT || "55432"), 
    user: process.env.DATABASE_USER || "neondb_owner",
    password: process.env.DATABASE_PASSWORD || "npg_YNDm4e0OFfGP",
    database: process.env.DATABASE_NAME || "neondb_owner",
    ssl: false, 
  },
});
