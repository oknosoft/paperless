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

  onBarcode(barcode) {
    super.onBarcode(barcode)
      .then((bar) => {
        if(!bar) {
          return;
        }
        const {project, constructor} = this.editor;
        const {cnstr, ox} = bar;
        project.load(ox, {custom_lines: false, mosquito: false})
          .then(() => {
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
      })
      .catch(({message}) => {
        const {ox} = this.state;
        if(ox && ox.unload) {
          ox.unload();
        }
        this.editor.project.clear();
        this.setState({ox: {}});
      });
  }

  registerRep = (el) => {
    this.rep = el;
  }

  render() {
    const {state: {ox}, props: {classes}, editor} = this;
    const has_ox = editor && ox && ox.empty && !ox.empty();
    return <WorkPlaceFrame>
      <Grid item sm={12} lg={6} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      <Grid item sm={12} lg={3} className={classes.props}>
        {has_ox && <Nom {...this.state} registerRep={this.registerRep} complete_list_sorting={[11,20]}/>}
      </Grid>
      <Grid item sm={12} lg={3} className={classes.props}>
        <Props ox={ox} cnstr={0} show_spec={false}/>
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
