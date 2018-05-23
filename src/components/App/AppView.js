import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Snack from 'metadata-react/App/Snack';       // сообщения в верхней части страницы (например, обновить после первого запуска)
import Alert from 'metadata-react/App/Alert';       // диалог сообщения пользователю
import Confirm from 'metadata-react/App/Confirm';   // диалог вопросов пользователю (да, нет)
import FrmLogin from 'metadata-react/FrmLogin';     // логин и свойства подключения
import NeedAuth from 'metadata-react/App/NeedAuth'; // страница "необхлдима авторизация"
import AppDrawer from 'metadata-react/App/AppDrawer';
import HeaderButtons from 'metadata-react/Header/HeaderButtons';

import DumbScreen from '../DumbScreen';       // заставка "загрузка занных"
import DataRoute from './DataRoute';          // вложенный маршрутизатор страниц с данными
import AboutPage from '../About';             // информация о программе
import HomeView from '../Home';               // домашняя страница
import Settings from '../Settings';           // страница настроек приложения
import Furn from '../Furn';                   // фурнитурная станция
import Imposts from '../Imposts';             // установка импостов


import {withIfaceAndMeta} from 'metadata-redux';
import withStyles from './styles';
import withWindowSize from 'metadata-react/WindowSize';
import compose from 'recompose/compose';


import items, {item_props} from './menu';

const mainTitle = 'Безбумажка';

// основной layout
class AppView extends Component {

  constructor(props, context) {
    super(props, context);
    this.handleAlertClose = this.handleDialogClose.bind(this, 'alert');
    const iprops = item_props();
    this.state = {
      need_meta: !!iprops.need_meta,
      need_user: !!iprops.need_user,
      mobileOpen: false,
      permanentClose: false,
    };
  }

  shouldComponentUpdate(props, {need_user, need_meta}) {
    const iprops = item_props();
    let res = true;

    if(need_user != !!iprops.need_user) {
      this.setState({need_user: !!iprops.need_user});
      res = false;
    }

    if(need_meta != !!iprops.need_meta) {
      this.setState({need_meta: !!iprops.need_meta});
      res = false;
    }

    return res;
  }

  handleDialogClose(name) {
    this.props.handleIfaceState({component: '', name, value: {open: false}});
  }

  handleReset(reset) {
    const {handleNavigate, first_run} = this.props;
    (first_run || reset) ? window.location.replace('/') : handleNavigate('/');
  }

  handleDrawerToggle = () => {
    const state = {mobileOpen: !this.state.mobileOpen};
    if(state.mobileOpen && this.state.permanentClose) {
      state.permanentClose = false;
    }
    this.setState(state);
  };

  handleDrawerClose = () => {
    this.setState({mobileOpen: false});
  };

  handlepPermanentClose = () => {
    this.setState({permanentClose: true, mobileOpen: false});
  };

  renderHome = (routeProps) => {
    const {classes, title, handleNavigate, handleIfaceState} = this.props;
    const {root, hero, content, text, headline, button, logo} = classes;
    return <HomeView
      classes={{root, hero, content, text, headline, button, logo}}
      title={title}
      handleNavigate={handleNavigate}
      handleIfaceState={handleIfaceState}
      {...routeProps}
    />;
  };

  render() {
    const {props, state} = this;
    const {classes, handleNavigate, location, snack, alert, confirm, doc_ram_loaded, title, sync_started, fetch, user, couch_direct, offline,
            meta_loaded} = props;
    const isHome = location.pathname === '/';

    let appBarClassName = classes.appBar;

    const mainContent = () => {

      const dstyle = {marginTop: 49};

      if(meta_loaded && state.need_user && ((!user.try_log_in && !user.logged_in) || (couch_direct && offline))) {
        return (
          <div style={dstyle}>
            <NeedAuth
              handleNavigate={handleNavigate}
              handleIfaceState={props.handleIfaceState}
              title={title}
              offline={couch_direct && offline}
            />
          </div>
        );
      }

      if(!location.pathname.match(/\/login$/) && ((state.need_meta && !meta_loaded) || (state.need_user && !props.complete_loaded))) {
        return <DumbScreen
          title={doc_ram_loaded ? 'Подготовка данных в памяти...' :
            (user.try_log_in ? 'Авторизация на сервере CouchDB...' : 'Загрузка из IndexedDB...')}
          page={{text: doc_ram_loaded ? 'Индексы в памяти...' : (user.logged_in ? 'Почти готово...' : 'Получение данных...')}}
        />;
      }

      const wraper = (Component, routeProps) => {
        /* eslint-disable-next-line */
        const {classes, ...mainProps} = props;
        if(routeProps.match.path === '/articles') {
          mainProps.tagFilter = [$p.cat.tags_category.get(), $p.cat.tags_category.predefined('article')];
        }
        else if(routeProps.match.path === '/files') {
          mainProps.tagFilter = [$p.cat.tags_category.predefined('file')];
        }
        return <Component {...mainProps} {...routeProps} disablePermanent/>;
      };

      return (
        <div style={dstyle}>
          <Switch key="switch">
            <Route exact path="/" render={this.renderHome}/>
            <Route path="/:area(doc|cat|ireg|cch|rep).:name" render={(props) => wraper(DataRoute, props)}/>
            <Route path="/furn" render={(props) => wraper(Furn, props)}/>
            <Route path="/imposts" render={(props) => wraper(Imposts, props)}/>
            <Route path="/login" render={(props) => wraper(FrmLogin, props)}/>
            <Route path="/login" render={(props) => wraper(FrmLogin, props)}/>
            <Route path="/settings" render={(props) => wraper(Settings, props)}/>
            <Route path="/about" component={AboutPage} />
          </Switch>
        </div>
      );
    };

    if(isHome) {
      // home route, don't shift app bar or dock drawer
      appBarClassName += ` ${classes.appBarHome}`;
    }

    return [
      // основной layout
      <div key="content" className={classes.root}>
        <AppBar className={appBarClassName} color="default">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerToggle}
            >
              <MenuIcon/>
            </IconButton>

            <Typography className={classes.title} variant="title" color="inherit" noWrap>{title || mainTitle}</Typography>

            <HeaderButtons
              sync_started={sync_started}
              fetch={fetch}
              offline={offline}
              user={user}
              handleNavigate={handleNavigate}
              compact
              barColor="default"
            />

          </Toolbar>
        </AppBar>
        <AppDrawer
          className={classes.drawer}
          disablePermanent={true}
          onClose={this.handleDrawerClose}
          onPermanentClose={this.handlepPermanentClose}
          mobileOpen={state.mobileOpen}
          handleNavigate={handleNavigate}
          items={items}
          isHome={isHome}
          title={mainTitle}
        />

        {
          // основной контент или заставка загрузки или приглашение к авторизации
          mainContent()
        }
      </div>,

      // всплывающтй snackbar оповещений пользователя
      ((snack && snack.open) || (props.first_run && doc_ram_loaded)) &&
      <Snack
        key="snack"
        snack={snack}
        handleClose={snack && snack.open && !snack.reset ? this.handleDialogClose.bind(this, 'snack') : () => this.handleReset(snack && snack.reset)}
      />,

      // диалог сообщений пользователю
      alert && alert.open &&
        <Alert key="alert" open text={alert.text} title={alert.title} handleOk={this.handleAlertClose}/>,

      // диалог вопросов пользователю (да, нет)
      confirm && confirm.open &&
        <Confirm key="confirm" open text={confirm.text} title={confirm.title} handleOk={confirm.handleOk} handleCancel={confirm.handleCancel}/>,
    ];
  }
}

AppView.propTypes = {
  handleNavigate: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleIfaceState: PropTypes.func.isRequired,
  first_run: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
};

export default compose(withStyles, withWindowSize, withIfaceAndMeta)(AppView);
