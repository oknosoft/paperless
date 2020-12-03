// @flow

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import {Helmet} from 'react-helmet';
import cn from 'classnames';
import {description} from '../App/menu';

import withStyles from './styles';

const ltitle = 'Заказ дилера: безбумажка';

function PageHome({classes}) {
  return (
    <div className={classes.root}>
      <Helmet title={ltitle}>
        <meta name="description" content={description} />
      </Helmet>

      <Grid container  className={classes.hero}>

        <Grid item xs={12}>
          <Typography variant="h4" component="h1" className={cn(classes.content, classes.text)}>{description}</Typography>
        </Grid>

      </Grid>

    </div>
  );
}

PageHome.propTypes = {
  classes: PropTypes.object.isRequired,
  handleNavigate: PropTypes.func.isRequired,
  handleIfaceState: PropTypes.func.isRequired,
};


export default withStyles(PageHome);
