import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Flap from './Flap';
import Nom from './Nom';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Furn1 extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project, constructor}} = this;
    const {cnstr, ox} = bar;
    project.load(ox, {custom_lines: full_picture, mosquito: full_picture})
      .then(() => {
        if(full_picture) {
          return;
        }

        const contour = project.getItem({cnstr});
        if(contour) {

          // добавляем размерную линию ручки
          const {h_ruch, furn: {furn_set, handle_side}} = contour;
          if(h_ruch && handle_side && !furn_set.empty()) {
            const elm1 = contour.profile_by_furn_side(handle_side);
            const right = elm1.pos === elm1.pos._manager.right;
            new constructor.DimensionLineCustom({
              elm1,
              elm2: elm1,
              p1: right ? 2 : 1,
              p2: 'hho',
              parent: contour.l_dimensions,
              offset: right ? -100 : 100,
            });
          }

          // рисуем текущий слой
          project.draw_fragment({elm: -cnstr, faltz: 'faltz'});
          // прячем заполнения
          contour.glasses(true);
          // вписываем в размер экрана
          project.zoom_fit();
          this.setState(bar, () => {
            this.rep && Promise.resolve().then(() => {
              const {_obj} = this.rep.props;
              const row = _obj.production.get(0);
              row.characteristic = bar.ox;
              row.elm = bar.cnstr;
              this.rep.handleSave();
            });
          });
        }
      });
  }

  registerRep = (el) => {
    this.rep = el;
  }

  render() {
    const {state: {ox, full_picture}, props: {classes}, editor} = this;
    const has_ox = !full_picture && editor && ox && ox.empty && !ox.empty();
    return <WorkPlaceFrame>
      <Grid item sm={12} md={full_picture ? 8 : 4} xl={full_picture ? 9 : 6} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      {!full_picture && <Grid item sm={12} md={4} xl={3} className={classes.props}>
        {has_ox && <Nom {...this.state} count={1} registerRep={this.registerRep} complete_list_sorting={[11,20]}/>}
      </Grid>}
      <Grid item sm={12} md={4} xl={3} className={classes.props}>
        <Props ox={ox} cnstr={0} show_spec={false} changeFull={this.changeFull}/>
        {has_ox && <Flap {...this.state}/>}
      </Grid>
    </WorkPlaceFrame>;
  }
}

Furn1.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Furn1));
