const { Client } = require('pg');
const util = require('util');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const tableName = 'articles';

const isTableExist = async () => {
  const sql = util.format(
    'SELECT table_name'
    + ' FROM information_schema.tables'
    + " WHERE table_name = '%s'", tableName);
  console.log('SQL: ' + sql);

  const res = await client.query(sql);
  return res && res.rows && res.rows.length;
};

const createTable = async () => {
  const sql = util.format('CREATE TABLE %s (id text, text text)', tableName);
  console.log('SQL: ' + sql);

  await client.query(sql);
};

const setup = (async () => {
  await client.connect();
  try {
    if (!await isTableExist()) {
      await createTable();
      console.log(util.format('Table %s has been created.', tableName));
    } else {
      console.log(util.format('Table %s already exists.', tableName));
    }
  } finally {
    await client.end();
  }
})();
