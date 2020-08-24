/**
 * ### Карточка покупателя
 * обработчики событий и модификаторы данных
 *
 * Created by Evgeniy Malyarov on 13.11.2017.
 */

import {connect} from 'react-redux';
import {dispatchIface} from 'metadata-redux';

const state = {
  timeStamp: 0,
  s: '',     // текущее значение штрихкода
  input: null,

  keydown(evt, handleIfaceState) {

    if(evt.target.tagName === 'INPUT' && !this.input){
      return;
    }

    if(evt.code == 'Enter' || evt.code == 'NumpadEnter') {
      this.s && control(this.s);
      this.s = '';
      this.input && this.input.blur();
    }
    else if(evt.code == 'Escape' || evt.code == 'Backspace' || evt.code == 'Delete') {
      this.s = '';
    }
    else if(evt.code == 'KeyV' && evt.ctrlKey ||
      evt.code == 'Insert' && evt.shiftKey ||
      evt.code == 'F11' ||
      evt.code == 'F12'
    ) {
      return;
    }
    else if(evt.keyCode > 30) {
      // сравним время с предыдущим. если маленькое, добавляем в буфер. если большое - пишем последний элемент
      if(evt.timeStamp - this.timeStamp > 100 && !this.input) {
        this.s = '';
      }
      this.timeStamp = evt.timeStamp;
      this.s += evt.key;
    }

    this.input && handleIfaceState({
      component: '',
      name: 'barcode',
      value: this.s,
    });

    evt.preventDefault();
    evt.stopPropagation();
    return false;
  },

  blur(handleIfaceState) {
    if(this.input) {
      this.s = '';
      handleIfaceState({
        component: '',
        name: 'barcode',
        value: this.s,
      });
      this.input = null;
    }
  }
};

// для снэка
const timeout = 4000;

const wpaths = 'imposts,furn1,furn2,glass,welding,falsebinding,facing,arc'.split(',');

/**
 * Расшифровывает штрихкод
 * @param barcode
 */
export function decrypt(barcode, doc = {}) {

  if(typeof barcode === 'string') {
    barcode = barcode.trim();
  }

  return new Promise((resolve, reject) => {

    const {utils, cat: {characteristics}} = $p;
    const not_found = {
      error: true,
      message: 'not found',
    };

    if(utils.is_guid(barcode)) {
      // если передали guid
      characteristics.get(barcode, 'promise')
        .then((ox) => {
          if(ox.is_new()) {
            reject(not_found);
          }
          else {
            doc.ox = ox;
            if(!doc.cnstr) {
              doc.cnstr = 1;
            }
            resolve(doc);
          }
        })
        .catch((err) => {
          not_found.message = err.message;
          reject(not_found);
        });
    }
    else {
      // ищем barcode в _local/bar
      const {adapters: {pouch}, current_user, utils} = characteristics._owner.$p;
      const {pouch_db: db} = characteristics;
      const opts = {
        method: 'post',
        credentials: 'include',
        headers: Object.assign({'Content-Type': 'application/json'}, db.getBasicAuthHeaders({prefix: pouch.auth_prefix(), ...db.__opts.auth})),
        body: JSON.stringify({
          _id: `${moment().format('YYYYMMDDHHmmssSSS')}|${barcode}`,
          user: current_user ? current_user.ref : utils.blank.guid,
          place: location.pathname.substr(1).split('/')[0],
        })
      };
      return fetch(`/adm/api/scan`, opts)
        .then((res) => res.json())
        .then((doc) => {
          if(doc.error) {
            throw new Error(`${doc.error} ${doc.reason}`);
          }
          else if(!doc.characteristic) {
            throw new Error(`empty doc: ${JSON.stringify(doc)}`);
          }
          resolve(decrypt(doc.characteristic, doc));
        })
        .catch((err) => {
          not_found.message = err.message;
          reject(not_found);
        });
    }

  });
}

/**
 * Анализирует штрихкод перед излучением события
 * Выполняет служебные команды
 * @param barcode
 */
export function control(barcode) {
  const auth = barcode.split('@');
  const {current_user, ui: {dialogs}, adapters: {pouch}} = $p;
  if(auth.length === 2 && ['ldap', 'couchdb'].includes(auth[1])) {
    if(current_user) {
      dialogs.snack({message: `Для повторной авторизации завершите сеанс текущего пользователя`, timeout});
    }
    const [login, password] = auth[0].split(':');
    if(!login || !password) {
      dialogs.snack({message: `Не найдено имя или пароль в штрихкоде`, timeout});
    }
    else {
      pouch.props._auth_provider = auth[1];
      dialogs.snack({message: `Авторизация '${login}'`, timeout: timeout / 2});
      pouch.log_in(login, password)
        .then(() => {
          pouch.authorized ?
            dialogs.snack({message: `Успешный вход '${login}'`, timeout: timeout / 2})
            :
            dialogs.snack({message: `Ошибка входа '${login}'`, timeout});
        })
        .catch((err) => dialogs.snack({message: `Ошибка входа '${err.message || err}'`, timeout}));
    }
    return;
  }

  barcode = barcode.trim().toLowerCase();
  if(barcode === 'logout') {
    if(!current_user) {
      dialogs.snack({message: `Неоткуда выходить - пользователь не авторизован`, timeout});
    }
    else {
      pouch.log_out()
        .then(() => location.reload());
    }
    return;
  }
  if(wpaths.includes(barcode)) {
    return dialogs.handleNavigate(`/${barcode}`);
  }
  if(barcode.length > 20) {
    return dialogs.snack({message: `Подозрительно длинный штрихкод '${barcode}'`, timeout});
  }
  if(barcode.length < 3) {
    return dialogs.snack({message: `Подозрительно короткий штрихкод '${barcode}'`, timeout});
  }
  const {pathname} = location;
  if(wpaths.some((path) => pathname.includes(path))) {
    $p.md.emit_async('barcode', barcode);
  }
  else {
    dialogs.snack({message: `Не выбрано рабочее место (заполнения, импосты, раскладка...)`, timeout});
  }

}

function mapDispatchToProps(dispatch) {
  const {handleIfaceState} = dispatchIface(dispatch);
  return {

    bodyKeyDown(evt) {
      return state.keydown(evt, handleIfaceState);
    },

    onFocus(evt) {
      state.input = evt.target;
    },

    onBlur() {
      state.blur(handleIfaceState);
    },

    onPaste(evt) {
      const str = evt.clipboardData.getData('text/plain');
      str && control(str);
      evt.target.blur();
    }
  };
}

export default connect(null, mapDispatchToProps);
