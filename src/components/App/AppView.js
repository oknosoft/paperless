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
import Login, {FrmLogin} from 'metadata-react/FrmLogin/Proxy';  // логин и свойства подключения
import NeedAuth from 'metadata-react/App/NeedAuth'; // страница "необхлдима авторизация"
import AppDrawer from 'metadata-react/App/AppDrawer';
import HeaderButtons from 'metadata-react/Header/HeaderButtons';

import Barcode from '../Barcode';
import ScanTotals from '../ScanStat/ScanTotals';
import DumbScreen from '../DumbScreen';       // заставка "загрузка занных"
import DataRoute from './DataRoute';          // вложенный маршрутизатор страниц с данными
import AboutPage from '../About';             // информация о программе
import HomeView from '../Home';               // домашняя страница
import Settings from '../Settings';           // страница настроек приложения
import Furn1 from '../Furn1';                 // фурнитурная станция
import Furn2 from '../Furn2';                 // фурнитурная станция
import Imposts from '../Imposts';             // установка импостов
import Glass from '../Glass';                 // остеклание
import Welding from '../Welding';             // сварка
import Falsebinding from '../Falsebinding';   // фальшпереплёты
import Facing from '../Facing';               // раскладка
import Arc from '../Arc';                     // арки, трапеции


import {withIfaceAndMeta} from 'metadata-redux';
import {compose} from 'redux';
import withStyles from './styles';
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
    const {classes, title, handleNavigate, handleIfaceState, meta_loaded} = this.props;
    const {root, hero, content, text, headline, button, logo} = classes;
    return <HomeView
      classes={{root, hero, content, text, headline, button, logo}}
      title={title}
      handleNavigate={handleNavigate}
      handleIfaceState={handleIfaceState}
      meta_loaded={meta_loaded}
      {...routeProps}
    />;
  };

  render() {
    const {props, state} = this;
    const {classes, handleNavigate, location, snack, alert, confirm, doc_ram_loaded, title, sync_started, fetch, user,
      couch_direct, offline, meta_loaded, barcode, page, idle} = props;

    const isHome = location.pathname === '/';

    let appBarClassName = classes.appBar;

    const mainContent = () => {

      const dstyle = {marginTop: 48};

      const auth_props = {
        key: 'auth',
        handleNavigate: props.handleNavigate,
        handleIfaceState: props.handleIfaceState,
        offline: couch_direct && offline,
        user,
        title,
        idle,
        disable: ['google'],
        //ret_url: path(''),
      };

      if(meta_loaded && state.need_user && ((!user.try_log_in && !user.logged_in) || (couch_direct && offline))) {
        return (
          <div style={dstyle}>
            <NeedAuth {...auth_props} ComponentLogin={FrmLogin}/>
          </div>
        );
      }

      if(!location.pathname.match(/\/login$/) && ((state.need_meta && !meta_loaded) || (state.need_user && !props.complete_loaded))) {
        return <DumbScreen
          title={doc_ram_loaded ? 'Подготовка данных в памяти...' : 'Загрузка справочников...'}
          page={page && page.docs_written < page.total_rows ? page : {text: `${(page && page.synonym) || 'Почти готово'}...`}}
          />;
      }

      const wraper = (Component, routeProps) => {
        /* eslint-disable-next-line */
        const {classes, ...mainProps} = props;
        return <Component {...mainProps} {...routeProps} disablePermanent/>;
      };

      return (
        <div style={dstyle}>
          <Switch key="switch">
            <Route exact path="/" render={this.renderHome}/>
            <Route path="/:area(doc|cat|ireg|cch|rep).:name" render={(props) => wraper(DataRoute, props)}/>
            <Route path="/imposts" render={(props) => wraper(Imposts, props)}/>
            <Route path="/furn1" render={(props) => wraper(Furn1, props)}/>
            <Route path="/furn2" render={(props) => wraper(Furn2, props)}/>
            <Route path="/glass" render={(props) => wraper(Glass, props)}/>
            <Route path="/welding" render={(props) => wraper(Welding, props)}/>
            <Route path="/falsebinding" render={(props) => wraper(Falsebinding, props)}/>
            <Route path="/facing" render={(props) => wraper(Facing, props)}/>
            <Route path="/arc" render={(props) => wraper(Arc, props)}/>
            <Route path="/login" render={(props) => <Login {...props} {...auth_props} />}/>
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
            <IconButton onClick={this.handleDrawerToggle}><MenuIcon color="inherit"/></IconButton>
            <Typography className={classes.title} variant="h6" color="textSecondary" noWrap>{title || mainTitle}</Typography>
            <Barcode className={classes.barcode} barcode={barcode} handleNavigate={handleNavigate} />
            <div className={classes.title} />
            {user.logged_in && <ScanTotals />}
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
  idle: PropTypes.bool,
  offline: PropTypes.bool,
  fetch: PropTypes.bool,
  couch_direct: PropTypes.bool,
  sync_started: PropTypes.bool,
  doc_ram_loaded: PropTypes.bool,
  meta_loaded: PropTypes.bool,
  complete_loaded: PropTypes.bool,
  snack: PropTypes.object,
  alert: PropTypes.object,
  confirm: PropTypes.object,
  user: PropTypes.object,
  page: PropTypes.object,
  barcode: PropTypes.string,
};

export default compose(withStyles, withIfaceAndMeta)(AppView);
