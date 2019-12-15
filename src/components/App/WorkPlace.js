/**
 * Абстрактное рабочее место
 *
 * @module WorkPlace
 *
 * Created by Evgeniy Malyarov on 15.12.2019.
 */

import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {item_props} from './menu';

export class WorkPlace extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.editor = null;
    this.onBarcode = this.onBarcode.bind(this);
    this.shouldComponentUpdate(props);
    this.state = {
      ox: {},
      cnstr: 1,
    };
  }

  onBarcode(barcode) {
    console.log(barcode);
  }

  shouldComponentUpdate({handleIfaceState, title}) {
    const iprops = item_props();
    if(iprops.text && title != iprops.text) {
      handleIfaceState({
        component: '',
        name: 'title',
        value: iprops.text,
      });
      return false;
    }
    return true;
  }

  componentDidMount() {
    $p.md.on('barcode', this.onBarcode);
  }

  componentWillUnmount() {
    $p.md.off('barcode', this.onBarcode);
  }

  registerEditor = (el) => {
    this.editor = el;
  };
}

function styles(theme) {
  return {
    workplace: {
      minHeight: 'calc(100vh - 50px)', // Makes the hero full height until we get some more content.
    },
    props: {
      paddingTop: theme.spacing(2),
    }
  };
};

export default withStyles(styles);
