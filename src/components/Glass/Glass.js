import React from 'react';
import Helmet from 'react-helmet';
import Typography from '@material-ui/core/Typography';
import AppContent from 'metadata-react/App/AppContent';
import {item_props} from '../App/menu';
import withStyles, {WorkPlace} from '../App/WorkPlace';

class Glass extends WorkPlace {

  render() {
    const iprops = item_props();
    return <AppContent>
      <Helmet title={iprops.text}>
        <meta name="description" content={iprops.title} />
      </Helmet>
      <div style={{marginTop: 16}}>
        <Typography variant="h4" component="h1" color="primary">{iprops.title}</Typography>
      </div>
    </AppContent>;
  }
}

export default withStyles(Glass);
