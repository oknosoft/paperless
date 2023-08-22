/**
 * Created 14.04.2020.
 */


module.exports = function paperless($p, log, route) {

  route.bar = require('./bar')($p, log);
  route.scan = require('./scan')($p, log);
  require('./meta')($p, log);

}
