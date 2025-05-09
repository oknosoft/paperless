import {createContext, useContext} from 'react';

// затычка - работаем с одной схемой для всех форм
const stubKey = '6df5fb00-2c23-11f0-9d06-05efcd9303c0';

const cache = new Map();
// схема компоновки в зависимости от ключа формы
export const initialContext = {
  // схема компоновки в зависимости от ключа формы
  findScheme(frmKey) {
    if(!frmKey) {
      frmKey = stubKey;
    }
    if(!cache.has(frmKey)) {
      cache.set(frmKey, $p.cat.scheme_settings.get(frmKey));
    }
    return cache.get(frmKey);
  },
};


export const ConditionalAppearanceContext = createContext(initialContext);
export const useConditionalAppearanceContext = () => useContext(ConditionalAppearanceContext);

