import {neon} from '@neondatabase/serverless'; 
import dotenv from 'dotenv'; 
import pkg from 'pg';
const { Pool } = pkg;


dotenv.config(); 

// const{PGHOST, PGUSER, PGPASSWORD, PGDATABASE} = process.env; 

// export const sql = neon(
//     `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
// )

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

export default pool;