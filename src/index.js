// шрифты и стили подгрузим асинхронно
import './styles/global.css';

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';

// метод инициализации хранилища состояния приложения
import configureStore, {history} from './redux';

// метод для вычисления need_meta, need_user для location.pathname
import {item_props} from './components/App/menu';

// заставка "загрузка занных"
import DumbScreen from './components/DumbScreen';

// корневыой контейнер приложения
import AppView from './components/App';

// дополняем-переопределяем тему оформления
import muiTheme from './styles/muiTheme';

// типовой RootView, в котором подключается Router и основной макет приложения
import RootView from 'metadata-react/App/RootView';

// создаём redux-store
const store = configureStore();

class RootProvider extends React.Component {

  componentDidMount() {
    // font-awesome, roboto и стили metadata подгрузим асинхронно
    import('metadata-react/styles/roboto/font.css');
    import('font-awesome/css/font-awesome.min.css');

    // скрипт инициализации структуры метаданных и модификаторы
    import('./metadata')
      .then((module) => module.init(store));
  }

  getChildContext() {
    return {store};
  }

  render() {
    return <Provider key="root" store={store}>
      <RootView
        history={history}
        item_props={item_props}
        theme={muiTheme}
        AppView={AppView}
        DumbScreen={DumbScreen}
        disableAutoLogin
      />
    </Provider>;
  }
}

RootProvider.childContextTypes = {
  store: PropTypes.object,
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RootProvider/>);
