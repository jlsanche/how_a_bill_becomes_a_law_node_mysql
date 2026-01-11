export const queryPromise = (mysql, sql, params) => {
    return new Promise((resolve, reject) => {
      mysql.pool.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };
