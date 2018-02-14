var mysql = require('mysql');
var pool = mysql.createPool({
      connectionLimit : 10,
          host            : 'oniddb.cws.oregonstate.edu',
          user            : 'abreuj-db',
          password        : 'rAvCqCuLH6BQGJHR',
          database        : 'abreuj-db'
});

module.exports.pool = pool;


