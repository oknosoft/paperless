import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Route} from 'react-router';

import {withObj} from 'metadata-redux';
import NeedAuth from 'metadata-react/App/NeedAuth'; // страница "необходима авторизация"

import NotFound from './NotFound';

const stub = () => null;

export const lazy = {
  DataList: stub,
  DataTree: stub,
  DataObj: stub,
  FrmReport: stub,
};

import('metadata-react/DynList')
  .then(module => {
    lazy.DataList = module.default;
    //return import('metadata-react/DataTree');
    return import('metadata-react/FrmObj');
  })
  // .then(module => {
  //   lazy.DataTree = module.default;
  //   return import('metadata-react/FrmObj');
  // })
  .then(module => {
    lazy.DataObj = module.default;
    return import('metadata-react/FrmReport');
  })
  .then(module => {
    lazy.FrmReport = module.default;
    import('metadata-react/styles/react-data-grid.css');
  });

class DataRoute extends React.Component {

  render() {
    const {match, handlers, couch_direct, offline, user} = this.props;
    const {area, name} = match.params;
    let _mgr = global.$p && $p[area][name];

    if(!_mgr) {
      return <NotFound/>;
    }

    // если нет текущего пользователя, считаем, что нет прав на просмотр
    if(!user.logged_in || !$p.current_user) {
      return (
        <NeedAuth
          handleNavigate={handlers.handleNavigate}
          handleIfaceState={handlers.handleIfaceState}
          offline={couch_direct && offline}
        />
      );
    }

    const _acl = $p.current_user.get_acl(_mgr.class_name);

    const wraper = (Component, props, type) => {
      if(type === 'obj' && _mgr.FrmObj) {
        Component = _mgr.FrmObj;
      }
      else if(type === 'list' && _mgr.FrmList) {
        Component = _mgr.FrmList;
      }
      return <Component _mgr={_mgr} _acl={_acl} handlers={handlers} {...props} />;
    };

    if(area === 'rep') {
      const Component = _mgr.FrmObj || lazy.FrmReport;
      return <Component _mgr={_mgr} _acl={_acl} match={match} />;
    }

    return <Switch>
      <Route path={`${match.url}/:ref([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})`} render={(props) => wraper(lazy.DataObj, props, 'obj')}/>
      <Route path={`${match.url}/list`} render={(props) => wraper(lazy.DataList, props, 'list')}/>
      {/**<Route path={`${match.url}/meta`} render={(props) => wraper(MetaObjPage, props)} />**/}
      <Route component={NotFound}/>
    </Switch>;
  }

  getChildContext() {
    return {components: lazy};
  }
}

DataRoute.propTypes = {
  match: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired,
  couch_direct: PropTypes.bool,
  offline: PropTypes.bool,
  user: PropTypes.object,
};

DataRoute.childContextTypes = {
  components: PropTypes.object,
};

export default withObj(DataRoute);




