import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({
  user: "postgres",
  password: "password",
  database: "word-puzzle-db",
  host: "localhost",
  port: "5432",
});

const execute = async (query) => {
  try {
    await pool.connect(); // create a connection
    await pool.query(query); // executes a query
    return true;
  } catch (error) {
    console.error(error.stack);
    return false;
  }
};

const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS "games" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
    console.log('Table "games" is ready');
  }
});

export default pool;
