// @flow

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import {item_props} from '../App/menu';
import Builder from '../Builder';

function styles(theme) {
  return {
    workplace: {
      minHeight: 'calc(100vh - 50px)', // Makes the hero full height until we get some more content.
    }
  };
}

class Imposts extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.editor = null;
    this.shouldComponentUpdate(props);
  }

  shouldComponentUpdate({handleIfaceState, title}) {
    const iprops = item_props();
    if(iprops.text && title != iprops.text){
      handleIfaceState({
        component: '',
        name: 'title',
        value: iprops.text,
      });
      return false;
    }
    return true;
  }

  render() {
    const {classes} = this.props;
    const iprops = item_props();
    return <Grid container>
      <Helmet title={iprops.text}>
        <meta name="description" content={iprops.title} />
      </Helmet>
      <Grid item sm={12} lg={8} className={classes.workplace}>
        <Builder
          registerChild={(el) => {
            this.editor = el;
          }}
        />
      </Grid>
      <Grid item sm={12} lg={4}>
        <div>свойства</div>
      </Grid>
  </Grid>;
  }
}

export default withStyles(styles)(withIface(Imposts));
