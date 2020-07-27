
// конструктор metadata.js
import MetaEngine from 'metadata-core';
import plugin_pouchdb from 'metadata-pouchdb';
import plugin_ui from 'metadata-abstract-ui';
import plugin_ui_tabulars from 'metadata-abstract-ui/tabulars';
import plugin_react from 'metadata-react/plugin';
import proxy_login from 'metadata-superlogin/proxy';

// функция установки параметров сеанса
import settings from '../../config/app.settings';

// принудительный редирект и установка зоны для абонентов с выделенными серверами
import {patch_prm, patch_cnn} from '../../config/patch_cnn';

// генератор события META_LOADED для redux
import {addMiddleware} from 'redux-dynamic-middlewares';
// стандартные события pouchdb и метаданных
import {metaActions, metaMiddleware, dispatchIface} from 'metadata-redux';
// дополнительные события pouchdb
import {customPouchMiddleware} from './reducers/pouchdb';

// читаем скрипт инициализации метаданных, полученный в результате выполнения meta:prebuild
import meta_init from 'wb-core/dist/init';
import modifiers from './modifiers';
import {load_ram, load_common} from './common/load_ram';
import {lazy} from '../components/App/DataRoute';

// подключаем плагины к MetaEngine
MetaEngine
  .plugin(plugin_pouchdb)     // подключаем pouchdb-адаптер к прототипу metadata.js
  .plugin(plugin_ui)          // подключаем общие методы интерфейса пользователя
  .plugin(plugin_ui_tabulars) // подключаем методы экспорта табличной части
  .plugin(plugin_react);      // подключаем react-специфичные модификаторы к scheme_settings

// создаём экземпляр MetaEngine и экспортируем его глобально
const $p = global.$p = new MetaEngine();

// параметры сеанса инициализируем сразу
$p.wsql.init(patch_prm(settings));
patch_cnn();

// со скрипом инициализации метаданных, так же - не затягиваем
meta_init($p);

// запускаем проверку единственности экземпляра
$p.utils.single_instance_checker.init();

// скрипт инициализации в привязке к store приложения
export function init(store) {

  try {

    const {dispatch} = store;

    // подключаем metaMiddleware
    addMiddleware(metaMiddleware($p));
    addMiddleware(customPouchMiddleware($p));

    // сообщяем адаптерам пути, суффиксы и префиксы
    const {wsql, job_prm, classes: {PouchDB}, adapters: {pouch}} = $p;
    PouchDB.plugin(proxy_login());
    pouch.init(wsql, job_prm);
    const opts = {auto_compaction: true, revs_limit: 3, owner: pouch, fetch: pouch.fetch};
    pouch.remote.ram = new PouchDB(pouch.dbpath('ram'), opts);

    // выполняем модификаторы
    modifiers($p);

    // затычки для совместимости
    $p.injected_data = {'toolbar_calc_order_production.xml': ''};
    $p.doc.calc_order.metadata()._mixin({
      form: {
        client_of_dealer: {
          fields: [],
          obj: {
            items: [{items: []}]
          }
        }
      }
    });

    // информируем хранилище о готовности MetaEngine
    dispatch(metaActions.META_LOADED($p));

    // инициализируем ui.dialogs
    $p.ui.dialogs.init(Object.assign({lazy}, dispatchIface(dispatch)));

    $p.md.once('predefined_elmnts_inited', () => {
      pouch.emit('pouch_complete_loaded');
    });

    pouch.on({
      on_log_in() {
        return load_ram($p);
      },
    });

    // читаем общие данные в ОЗУ
    return load_common($p);

  }
  catch (err) {
    $p && $p.record_log(err);
  }
}

export default $p;
