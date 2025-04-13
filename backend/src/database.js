import pkg from "pg";
import logger from './logger.js';


const { Pool } = pkg;
const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
});

const execute = async (query) => {
  try {
    await pool.connect();
    await pool.query(query);
    return true;
  } catch (error) {
    logger.error(error.stack);
    return false;
  }
};

const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS "games"
    (
        id
        uuid
        PRIMARY
        KEY
        DEFAULT
        gen_random_uuid
    (
    ),
        topic TEXT NOT NULL,
        title TEXT NOT NULL,
        grid TEXT[][] NOT NULL,
        words JSON NOT NULL,
        answers JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSON
        );
`;

execute(createTablesQuery).then((result) => {
  if (result) {
    logger.info('Table "games" is ready');
  }
});

export default pool;
