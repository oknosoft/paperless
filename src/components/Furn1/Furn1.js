import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Flap from './Flap';
import Nom from './Nom';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';
import {ConditionalAppearanceContext, initialContext} from '../ConditionalAppearance/context';

class Furn1 extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project, constructor}} = this;
    let {cnstr, ox} = bar;
    project.load(ox, {custom_lines: full_picture, mosquito: full_picture, redraw: true})
      .then(() => {
        if(full_picture) {
          return;
        }

        clearTimeout(project._attr._vis_timer);

        let layer = project.getItem({cnstr});
        if(layer) {
          if(!layer.layer && layer.contours.length) {
            layer = layer.contours[0];
            bar.cnstr = cnstr = layer.cnstr;
          }

          // добавляем размерную линию ручки
          const {h_ruch, furn: {furn_set, handle_side}} = layer;
          if(h_ruch && handle_side && !furn_set.empty()) {
            const elm1 = layer.profile_by_furn_side(handle_side);
            const right = elm1.pos === elm1.pos._manager.right;
            new constructor.DimensionLineCustom({
              elm1,
              elm2: elm1,
              p1: right ? 2 : 1,
              p2: 'hho',
              parent: layer.l_dimensions,
              offset: right ? -100 : 100,
            });
          }

          // рисуем текущий слой
          project.draw_fragment({elm: -cnstr, faltz: 'faltz'});
          // прячем заполнения
          layer.glasses(true);
          // вписываем в размер экрана
          project.zoom_fit();

          bar.layer = layer;
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
  };

  render() {
    const {state, props: {classes}, editor} = this;
    const {ox, full_picture} = state;
    const has_ox = !full_picture && editor && ox && ox.empty && !ox.empty();
    return <WorkPlaceFrame>
      <ConditionalAppearanceContext.Provider value={{...initialContext, ...state, editor }}>
        <Grid item sm={12} md={full_picture ? 8 : 4} xl={full_picture ? 9 : 6} className={classes.workplace}>
          <Builder registerChild={this.registerEditor}/>
        </Grid>
        {!full_picture && <Grid item sm={12} md={4} xl={3} className={classes.props}>
          {has_ox && <Nom {...state} count={1} registerRep={this.registerRep} complete_list_sorting={[11,20]}/>}
        </Grid>}
        <Grid item sm={12} md={4} xl={3} className={classes.props}>
          <Props ox={ox} cnstr={0} show_spec={false} changeFull={this.changeFull}/>
          {has_ox && <Flap {...state}/>}
        </Grid>
      </ConditionalAppearanceContext.Provider>
    </WorkPlaceFrame>;
  }
}

Furn1.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Furn1));
