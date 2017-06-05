const Sequelize = require('sequelize');
var config = require('../database/mysqlConfig.json');

let seq = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        'host' : config.host,
        'dialect': config.dialect
    }
);

module.exports = seq;