const { assertDistribution } = require('./check-distribution.cjs');
const config = { ...require('../package.json').build, extends: null };
assertDistribution(config);
module.exports = config;
