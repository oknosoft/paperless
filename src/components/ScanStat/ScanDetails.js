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
import Diagram from 'metadata-react/Diagrams/Diagram';
import withStyles from 'metadata-react/Diagrams/styles';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import {item_props} from '../App/menu';

class Details extends React.Component {

  state = {
    data: {
      kind: 'bar',
      hideLegend: false,
      points: [
        {
          name: 'date',
          presentation: 'Дата'
        }
      ],
      series: [
        {
          name: 'l',
          presentation: 'Всего',
          color: '#D02A35',
          opacity: 0.5
        },
        {
          name: 'd',
          presentation: 'Уникальных',
          color: '#1935A8',
          opacity: 0.5
        }
      ],
      rows: [
        {
          date: '01.01.2018',
          l: {value: 1000, presentation: '1 000'},
          d: {value: 200, presentation: '200'}
        }
      ]
    }
  };

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
          const data = Object.assign({}, this.state.data);
          data.rows.length = 0;
          for(const row of res) {
            data.rows.push({
              date: row[2].pad(2), //`${row[2].toFixed(2)}.${row[1].toFixed(2)}`,
              l: {value: row[5], presentation: row[5].toString()},
              d: {value: row[6], presentation: row[6].toString()},
            })
          }
          this.setState({data});
        }
      });
  };

  render() {
    const {current_user} = $p;
    const {props: {classes}, state: {data}} = this;
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
      <AutoSizer style={{overflow: 'hidden', width: '100%', height: '100%', paddingBottom: 48}}>
        {({width, height}) => {
          if(!height) {
            height = 300;
          }
          return <Diagram
            width={width}
            height={height}
            classes={classes}
            data={data}
          />;
        }}
    </AutoSizer>
    </Dialog>;
  }
}

Details.propTypes = {
  queryClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(Details);
