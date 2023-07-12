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


const styles = ({spacing}) => ({
  root: {
    cursor: 'pointer',
    marginRight: spacing(),
  },
  space: {
    marginRight: spacing(),
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
    this.timer = 0;// setTimeout(this.refresh, 4000);
  };

  refresh = () => {
    const {adapters: {pouch}, current_user, wsql} = $p;
    let person = wsql.get_user_param('individual_person');
    if(!current_user) {
      return;
    }
    if(!person) {
      person = current_user.ref;
    }
    return pouch.fetch(`/adm/api/scan?user=${person}&place=${location.pathname.substring(1).split('/')[0]}&totals_only=true`)
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
    const {cat: {work_centers, individuals}, wsql} = $p;
    const wc = work_centers.get(wsql.get_user_param('work_center'));
    const ip = individuals.get(wsql.get_user_param('individual_person'));
    return [
      <Typography
        key="wc"
        className={classes.space}
        title={`Рабочий центр: '${wc.empty() ? 'не задан' : wc.name}'`}>
        {wc.empty() ? '- ' : `${wc.name.substr(0, 12)} `}
      </Typography>,
      <Typography
        key="ip"
        className={classes.space}
        title={`Сотрудник: '${ip.empty() ? 'не задан' : ip.name}'`}>
        {ip.empty() ? '- ' : `${ip.name.substr(0, 20)} `}
      </Typography>,
      <Typography
        key="text"
        variant="h6"
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
