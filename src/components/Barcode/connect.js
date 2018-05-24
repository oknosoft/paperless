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

    if(evt.code == 'Enter' || evt.code == 'NumpadEnter') {
      this.s && $p.md.emit_async('barcode', this.s);
      this.s = '';
      state.input && state.input.blur();
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
      if(evt.timeStamp - this.timeStamp > 100 && !state.input) {
        this.s = '';
      }
      this.timeStamp = evt.timeStamp;
      this.s += evt.key;
    }

    state.input && handleIfaceState({
      component: '',
      name: 'barcode',
      value: state.s,
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
