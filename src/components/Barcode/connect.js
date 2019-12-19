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
      this.s && $p.md.emit_async('barcode', this.s);
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

// function mapStateToProps(state, props) {
//
// }

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
      const {adapters: {pouch}} = characteristics._owner.$p;
      const {pouch_db: db} = characteristics;
      const authHeader = db.getBasicAuthHeaders({prefix: pouch.auth_prefix(), ...db.__opts.auth});
      return fetch(`${db.name}/_local/bar|${barcode}`, {
        headers: Object.assign({'Content-Type': 'application/json'}, authHeader),
      })
        .then((res) => res.json())
        .then((doc) => {
          resolve(decrypt(doc.characteristic, doc));
        })
        .catch((err) => {
          not_found.message = err.message;
          reject(not_found);
        });
    }

  });
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
      str && $p.md.emit_async('barcode', str);
      evt.target.blur();
    }
  };
}

export default connect(null, mapDispatchToProps);
