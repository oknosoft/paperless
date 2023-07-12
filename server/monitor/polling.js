/**
 * Ответ монитора в формате longpoll
 */

module.exports = class Polling {

  constructor(db, log) {
    this.db = db;
    this.log = log;
    this.feed = db.changes({
      live: true,
      include_docs: true,
      since: 'now',
      style: 'main_only'
    })
      .on('change', this.handleChange.bind(this))
      .on('error', log);
    this.responses = new Set();
    this.heartbeat = this.heartbeat.bind(this);
    this.heartbeat();
  }

  /**
   * Пишет пустую строку во все активные ответы, чтобы освежить соединение
   */
  heartbeat() {
    for (const el of this.responses) {
      const {res} = el;
      if(res.finished || !res.socket.writable) {
        this.responses.delete(el);
      }
      else {
        res.write('\n');
      }
    }
    setTimeout(this.heartbeat, 20000);
  }

  /**
   * Добавляет response в очередь
   */
  add(el) {
    const {res} = el;
    res.setHeader('Cache-Control', 'must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Server', 'metadata-common-catalogs');
    res.setHeader('X-Powered-By', 'metadata-auth-proxy');
    res.write('{"results":[');
    this.responses.add(el);
  }

  /**
   * Оповещает всех подписчиков об изменениях
   */
  handleChange({doc, ...change}) {
    const data = `${JSON.stringify(change)}], "last_seq": ${change.seq}}\n`;
    for(const el of this.responses) {
      const {query, res} = el;

      // а надо ли информировать данного подписчика
      if(!true) {
        continue;
      }

      this.responses.delete(el);
      try{
        res.end(data);
      }
      catch (e) {
        this.log(e);
      }
    }
  }

}
