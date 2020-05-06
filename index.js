const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { join } = require('path');
const { Pool } = require('pg');
const util = require('util');
const uuid = require('uuid/v4');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const tableName = 'articles';

const __okOrNot = (res, ok) => {
  res.header('Content-Type', 'text/plain; charset=UTF-8');
  res.end(ok ? 'OK' : 'NOT OK');
};

const __handlePgError = (res, err, msg) => {
  console.error('Error ' + msg, err.stack);
  __okOrNot(res, false);
};

const __isNotEmpty = result => {
  return result && result.rows && result.rows.length;
};

const __listIds = (res) => {
  pool.connect((err, client, done) => {
    if (err) {
      done();
      return __handlePgError(res, err, 'acquiring client');
    }

    const sql = util.format('SELECT id FROM %s', tableName);
    console.log('SQL: ' + sql);

    client.query(sql, (err, result) => {
      done();
      if (err) {
        return __handlePgError(res, err, 'executing query');
      }

      if (__isNotEmpty(result)) {
        let text = '';
        result.rows.forEach(row => text += row.id + '\n');
        res.end(text);
      } else {
        res.end('Empty');
      }
    });
  });
};

const __getArticle = (id, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      done();
      return __handlePgError(res, err, 'acquiring client');
    }

    const sql = util.format('SELECT text FROM %s WHERE id = $1', tableName);
    const values = [id];

    client.query(sql, values, (err, result) => {
      done();
      if (err) {
        return __handlePgError(res, err, 'executing query');
      }

      if (__isNotEmpty(result)) {
        res.header('Content-Type', 'text/plain; charset=UTF-8');
        res.end(result.rows[0].text);
      } else {
        res.status(404).send('Untitled\n');
      }
    });
  });
};

const __addArticle = (id, text, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      done();
      return __handlePgError(res, err, 'acquiring client');
    }

    const sql1 = util.format('SELECT id FROM %s WHERE id = $1', tableName);
    const values1 = [id];

    client.query(sql1, values1, (err, result) => {
      if (err) {
        done();
        return __handlePgError(res, err, 'executing query');
      }

      const sql2 = __isNotEmpty(result)
        ? util.format('UPDATE %s SET text = $2 WHERE id= $1', tableName)
        : util.format('INSERT INTO %s VALUES($1, $2)', tableName);
      const values2 = [id, text];

      client.query(sql2, values2, (err, _) => {
        done();
        if (err) {
          return __handlePgError(res, err, 'executing query');
        }
        __okOrNot(res, true);
      });
    });
  });
};

const __deleteArticle = (id, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      done();
      return __handlePgError(res, err, 'acquiring client');
    }

    const sql = util.format('DELETE FROM %s WHERE id = $1', tableName);
    const values = [id];

    client.query(sql, values, (err, _) => {
      done();
      if (err) {
        return __handlePgError(res, err, 'executing query');
      }
      __okOrNot(res, true);
    });
  });
};

const __parseText = (req, _, next) => {
  req.text = '';
  req.setEncoding('utf8');
  req.on('data', function (chunk) { req.text += chunk });
  req.on('end', next);
};

const startApp = (() => {
  const app = express();

  app.use(morgan('dev'));
  app.use(helmet());
  app.use(express.static(join(__dirname, 'public')));

  app.get('/__uuid', (_, res) => {
    res.end(uuid());
  });

  app.get('/__all', (_, res) => {
    __listIds(res);
  });

  app.get('/__articles/:id', (req, res) => {
    if (req.params.id) {
      __getArticle(req.params.id, res);
    } else {
      res.status(404).send('Not Found');
    }
  });

  app.post('/__articles/:id', __parseText, (req, res) => {
    __addArticle(req.params.id, req.text, res);
  });

  app.delete('/__articles/:id', (req, res) => {
    __deleteArticle(req.params.id, res);
  });

  app.get('/*', (_, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });

  process.on('SIGINT', function () {
    process.exit();
  });

  const port = process.env.PORT || 80

  app.listen(port, () => console.log(`Listening on ${port}...`));
})();
