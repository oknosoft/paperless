import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Specification from './Specification';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Crackers extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project, PointText, Contour}} = this;
    const {elm, ox} = bar;
    project.load(ox, {auto_lines: full_picture, custom_lines: full_picture, mosquito: full_picture, redraw: true})
      .then(() => {
        if(full_picture) {
          return;
        }

        const profile = project.getItem({elm});
        if(profile?.crackers_dimensions) {

          // рисуем текущий слой
          project.draw_fragment({elm});

          // рисуем спецразмеры импостов
          profile.crackers_dimensions();

          // показываем номера элементов на палках
          project.l_dimensions.visible = true;
          profile.draw_articles(1);
          profile.mark_direction();

        }
        else {
          project.clear();
          project.l_connective.visible = true;
          new PointText({
            parent: project.l_connective,
            name: 'text',
            justification: 'left',
            fillColor: 'black',
            content: elm ? `Не найден профиль №${elm}` : 'Не указан профиль в штрихкоде',
            fontSize: 120,
            point: [-300, 80],
          });
        }
        // вписываем в размер экрана
        project.zoom_fit();
        this.setState(bar);
      });
  }

  render() {
    const {state: {full_picture, ox}, props: {classes}} = this;
    return <WorkPlaceFrame>
      <Grid item sm={12} md={full_picture ? 9 : 8} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      <Grid item sm={12} md={full_picture ? 3 : 4} className={classes.props}>
        <Props {...this.state} show_spec={false} changeFull={this.changeFull}/>
        {ox && ox.empty && !ox.empty() ? <Specification {...this.state}/> : null}
      </Grid>
    </WorkPlaceFrame>;
  }
}

Crackers.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Crackers));
