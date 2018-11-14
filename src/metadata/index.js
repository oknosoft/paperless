
// функция установки параметров сеанса
import settings from '../../config/app.settings';

// принудительный редирект и установка зоны для абонентов с выделенными серверами
import {patch_prm, patch_cnn} from '../../config/patch_cnn';

// генератор события META_LOADED для redux
import {addMiddleware} from 'redux-dynamic-middlewares';
// стандартные события pouchdb и метаданных
import {metaActions, metaMiddleware} from 'metadata-redux';
// дополнительные события pouchdb
import {customPouchMiddleware} from './reducers/pouchdb';

// читаем скрипт инициализации метаданных, полученный в результате выполнения meta:prebuild
import meta_init from './init';
import modifiers from './modifiers';

import reset_cache from './reset_cache';

// конструктор metadata.js
import MetaEngine from 'metadata-core';
import plugin_pouchdb from 'metadata-pouchdb';
import plugin_ui from 'metadata-abstract-ui';
import plugin_ui_tabulars from 'metadata-abstract-ui/tabulars';
import plugin_react from 'metadata-react/plugin';


MetaEngine
  .plugin(plugin_pouchdb)     // подключаем pouchdb-адаптер к прототипу metadata.js
  .plugin(plugin_ui)          // подключаем общие методы интерфейса пользователя
  .plugin(plugin_ui_tabulars) // подключаем методы экспорта табличной части
  .plugin(plugin_react);      // подключаем react-специфичные модификаторы к scheme_settings

/* eslint-disable-next-line */
require('pouchdb-authentication');

// создаём экземпляр MetaEngine и экспортируем его глобально
const $p = global.$p = new MetaEngine();

// параметры сеанса и метаданные инициализируем без лишних проволочек
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
    const {wsql, job_prm, adapters: {pouch}, utils: {load_script}, md} = $p;
    pouch.init(wsql, job_prm);
    reset_cache(pouch);

    // читаем paperjs и deep-diff
    load_script('/dist/paperjs-deep-diff.min.js', 'script')
      .then(() => load_script('/dist/drawer.js', 'script'))
      .then(() => {
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

        md.once('predefined_elmnts_inited', () => {
          pouch.off('on_log_in');
          pouch.emit('pouch_complete_loaded');
        });

        // читаем локальные данные в ОЗУ
        return pouch.load_data();

      })
      .then(() => pouch.attach_refresher())
      .catch((err) => $p && $p.record_log(err));

  }
  catch (err) {
    $p && $p.record_log(err);
  }
}

export default $p;
