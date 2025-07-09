import {neon} from '@neondatabase/serverless'; 
import dotenv from 'dotenv'; 
import pkg from 'pg';
const { Pool } = pkg;


dotenv.config(); 

// const{PGHOST, PGUSER, PGPASSWORD, PGDATABASE} = process.env; 

// export const sql = neon(
//     `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
// )

// const pool = new Pool({
//   host: process.env.PGHOST,
//   port: process.env.PGPORT,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   database: process.env.PGDATABASE,
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Supabase

});
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }, // required for Supabase
//   max: 20,                 // allow more simultaneous connections (adjust based on Supabase plan)
//   idleTimeoutMillis: 30000, // idle connection timeout (30 seconds)
//   connectionTimeoutMillis: 5000 // wait max 5s for a connection before throwing error
// });


export default pool;