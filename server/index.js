/**
 * Created 14.04.2020.
 */


module.exports = function calc_stat($p, log, route) {

  route.bar = require('./bar')($p, log);
  route.scan = require('./scan')($p, log);

}
