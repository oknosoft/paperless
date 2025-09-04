import React from 'react';

import IconInfo from '@material-ui/icons/Info';
import IconPerson from '@material-ui/icons/Person';
import IconSettings from '@material-ui/icons/Settings';
import EqualizerIcon from '@material-ui/icons/Equalizer';

const items = [
  {
    text: 'Универсальное',
    title: 'Стандартный эскиз',
    id: 'universal',
    navigate: '/universal',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Импосты',
    title: 'Установка импостов',
    id: 'imposts',
    navigate: '/imposts',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Фурнитура створки',
    title: 'Оковка створки',
    id: 'furn1',
    navigate: '/furn1',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Навеска створки',
    title: 'Установка створки в раму',
    id: 'furn2',
    navigate: '/furn2',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Остекление',
    title: 'Установка заполнений',
    id: 'glass',
    navigate: '/glass',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Сварка',
    title: 'Сварка контура',
    id: 'welding',
    navigate: '/welding',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Фальш-переплет',
    title: 'Поклейка фальш-переплета',
    id: 'falsebinding',
    navigate: '/falsebinding',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Раскладка',
    title: 'Установка раскладки',
    id: 'facing',
    navigate: '/facing',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Арки/Трапеции',
    title: 'Арки, трапеции',
    id: 'arc',
    navigate: '/arc',
    need_meta: true,
    need_user: true,
  },
  {
    text: 'Сухари',
    title: 'Установка сухарей',
    id: 'crackers',
    navigate: '/crackers',
    need_meta: true,
    need_user: true,
  },
  {
    divider: true,
  },
  {
    text: 'Монитор',
    navigate: '/monitor',
    title: 'Статистика сканирований',
    need_meta: true,
    need_user: true,
    icon: <EqualizerIcon/>
  },
  {
    text: 'Профиль',
    navigate: '/login',
    title: 'Свойства пользователя',
    need_meta: true,
    icon: <IconPerson/>
  },
  {
    text: 'Настройки',
    navigate: '/settings',
    title: 'Параметры программы',
    need_meta: true,
    icon: <IconSettings/>,
  },
  {
    text: 'О программе',
    title: 'Безбумажное производство для Заказа дилера',
    navigate: '/about',
    icon: <IconInfo/>
  }
];

function path_ok(path, item) {
  const pos = item.navigate && item.navigate.indexOf(path);
  return pos === 0 || pos === 1;
}

function with_recursion(path, parent) {
  if(path && path != '/'){
    for(const item of parent){
      const props = item.items ? with_recursion(path, item.items) : path_ok(path, item) && item;
      if(props){
        return props;
      }
    }
  }
}

export function item_props(path) {
  if(!path){
    path = location.pathname;
  }
  if(path.endsWith('/')) {
    path = path.substr(0, path.length - 1);
  }
  // здесь можно переопределить нужность meta и авторизованности для корневой страницы
  let res = with_recursion(path, items);
  if(!res && path.indexOf('/') !== -1) {
    res = with_recursion(path.substr(0, path.lastIndexOf('/')), items);
  }
  if(!res && path.match(/\/(doc|cat|ireg|cch|rep)\./)){
    res = {need_meta: true, need_user: true};
  }
  return res || {};
}

export const description = 'Безбумажное производство';

export default items;
