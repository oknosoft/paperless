// @flow

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Helmet from 'react-helmet';

import {description} from '../App/menu';

import styles from './styles';

const ltitle = 'business-programming';

function PageHome(props) {
  const {classes, handleNavigate, title} = props;

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

      <Grid container spacing={24} className={classes.hero}>
        <Grid item sm={12} lg={6}>
          <div className={classes.content}>
            <div className={classes.text} onClick={() => handleNavigate('/articles/')}>
              <Typography variant="headline" component="h2" color="inherit">Статьи</Typography>
              <Typography variant="subheading" component="h3" color="inherit" className={classes.headline}>
                Программирование бизнеса
              </Typography>
            </div>
          </div>
        </Grid>
        <Grid item sm={12} lg={6}>
          <div className={classes.content}>
            <div className={classes.text} onClick={() => handleNavigate('/articles/flowcon-readme')}>
              <Typography variant="headline" component="h2" color="inherit">Flowcon</Typography>
              <Typography variant="subheading" component="h3" color="inherit" className={classes.headline}>
                Программно-методический комплекс<br/> для управления потоками задач
              </Typography>
            </div>
          </div>
        </Grid>
        <Grid item sm={12} lg={6}>
          <div className={classes.content}>
            <div className={classes.text} onClick={() => handleNavigate('/check')}>
              <Typography variant="headline" component="h2" color="inherit">Проверка данных</Typography>
              <Typography variant="subheading" component="h3" color="inherit" className={classes.headline}>
                Библиотека алгоритмов
              </Typography>
            </div>
          </div>
        </Grid>
        <Grid item sm={12} lg={6}>
          <div className={classes.content}>
            <div className={classes.text} onClick={() => handleNavigate('/planing')}>
              <Typography variant="headline" component="h2" color="inherit">Планирование ресурсов</Typography>
              <Typography variant="subheading" component="h3" color="inherit" className={classes.headline}>
                Простое решение
              </Typography>
            </div>
          </div>
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
