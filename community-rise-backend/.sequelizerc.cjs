// sequelize-cli settings. Uses the .cjs extension so Node always loads it as
// CommonJS (an extension-less .sequelizerc is treated as an ES module on newer
// Node versions because package.json has "type": "module"). The npm db:*
// scripts pass --options-path .sequelizerc.cjs.
const path = require('path');

module.exports = {
  config: path.resolve('src', 'config', 'database.cjs'),
  'models-path': path.resolve('src', 'models'),
  'migrations-path': path.resolve('src', 'db', 'migrations'),
  'seeders-path': path.resolve('src', 'db', 'seeders'),
};
