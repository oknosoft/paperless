/**
 *
 *
 * @module ScanDetails
 *
 * Created by Evgeniy Malyarov on 09.02.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'metadata-react/App/Dialog';
import {item_props} from '../App/menu';

class Details extends React.Component {

  state = {data: []};

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    const {adapters: {pouch}, current_user} = $p;
    if(!current_user) {
      return;
    }
    const {doc: db} = pouch.remote;
    const opts = {
      method: 'get',
      credentials: 'include',
      headers: Object.assign({'Content-Type': 'application/json'}, db.getBasicAuthHeaders({prefix: pouch.auth_prefix(), ...db.__opts.auth})),
    };
    return fetch(`/adm/api/scan?user=${current_user.ref}&place=${location.pathname.substr(1).split('/')[0]}&totals_only=true&period=month`, opts)
      .then((res) => res.json())
      .then((res) => {
        if(Array.isArray(res)) {
          this.setState({data: res});
        }
      });
  };

  render() {
    const {current_user} = $p;
    return <Dialog
      open
      initFullScreen
      large
      title={`Лог сканирований (${item_props().text}, ${current_user ? current_user.name : 'Не авторизован'})`}
      onClose={this.props.queryClose}
      // actions={[
      //   <Button key="ok" onClick={this.handleOk} color="primary">Ок</Button>,
      //   <Button key="cancel" onClick={handleCancel} color="primary">Отмена</Button>
      // ]}
      // toolbtns={<Toolbtn suggest_type={suggest_type} handleSuggestType={this.handleSuggestType}/>}
    >
      Расшифровка пока не готова
    </Dialog>;
  }
}

Details.propTypes = {
  queryClose: PropTypes.func.isRequired,
};

export default Details;
