/**
 * Индикатор итогов сканирования
 *
 * @module ScanTotals
 *
 * Created by Evgeniy Malyarov on 09.02.2020.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
//import Details from './ScanDetails';
import withStyles from '@material-ui/core/styles/withStyles';


const styles = theme => ({
  root: {
    marginRight: theme.spacing(),
    cursor: 'pointer',
  }
});

class Totals extends React.Component {

  constructor() {
    super();
    this.state = {value: '0/0', open: false};
    this.timer = 0;
    this._mounted = false;
  }

  componentDidMount() {
    $p.md.on('barcode', this.onBarcode);
    this.onBarcode();
    this._mounted = true;
  }

  componentWillUnmount() {
    $p.md.off('barcode', this.onBarcode);
    this._mounted = false;
  }

  onBarcode = () => {
    this.timer && clearTimeout(this.timer);
    this.timer = setTimeout(this.refresh, 4000);
  };

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
    return fetch(`/adm/api/scan?user=${current_user.ref}&place=${location.pathname.substr(1).split('/')[0]}&totals_only=true`, opts)
      .then((res) => res.json())
      .then(({d, l, error}) => {
        if(!error && this._mounted) {
          this.setState({value: `${l}/${d}`});
        }
      });
  };

  openRep = () => {
    //this.setState({open: true});
    $p.ui.dialogs.alert({title: 'Recharts', text: 'Временно отключено'});
  };

  closeRep = () => {
    this.setState({open: false});
  };

  render() {
    const {state: {value, open}, props: {classes}} = this;
    return [
      <Typography
        key="text"
        variant="h5"
        className={classes.root}
        onClick={this.openRep}
        title="Сканирований за день (всего/уникальных)">{value}</Typography>,
      // open && <Details key="details" queryClose={this.closeRep}/>,
    ];
  }
}

Totals.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Totals);
