/**
 * Формирует индекс сканирований в ОЗУ
 * Временный вариант без Postgres
 */

const Subscriber = require('./subscriber');

module.exports = function stat($p, log) {

  const {adapters: {pouch}, utils} = $p;
  const events = new Subscriber(pouch.remote.events, utils, log);

}
