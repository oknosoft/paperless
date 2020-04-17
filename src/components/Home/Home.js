// @flow

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import {Helmet} from 'react-helmet';
import cn from 'classnames';

import {description} from '../App/menu';

import styles from './styles';

const ltitle = 'Заказ дилера';

function PageHome(props) {
  const {classes, title} = props;

  if(title != ltitle) {
    props.handleIfaceState({
      component: '',
      name: 'title',
      value: ltitle,
    });
  }

  return (
    <div className={classes.root}>
      <Helmet title={ltitle}>
        <meta name="description" content={description} />
      </Helmet>

      <Grid container  className={classes.hero}>

        <Grid item xs={12}>
          <Typography variant="h4" component="h1" className={cn(classes.content, classes.text)}>Безбумажное производство</Typography>
        </Grid>

      </Grid>

    </div>
  );
}

PageHome.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  handleNavigate: PropTypes.func.isRequired,
  handleIfaceState: PropTypes.func.isRequired,
};

export default withStyles(styles)(PageHome);
