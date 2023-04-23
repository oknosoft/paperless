import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Fillings from './Fillings';
import Flaps from './Flaps';
import Locks from './Locks';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Glass extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project, PointText, consts}} = this;
    let {cnstr, ox} = bar;
    project.load(ox, {custom_lines: full_picture, mosquito: full_picture /*, visualization: false */})
      .then(() => {
        if(full_picture) {
          return;
        }

        let contour = project.getItem({cnstr});
        if(contour) {
          if(contour.layer) {
            contour = contour.layer;
            cnstr = contour.cnstr;
          }

          // прячем лишние рамные слои
          for(const cnt of project.contours) {
            if(cnt !== contour && cnt.layer !== contour) {
              cnt.visible = false;
            }
          }

          // рисуем номера заполнений
          for(const filling of contour.fillings) {
            new PointText({
              parent: filling,
              guide: true,
              justification: 'right',
              fillColor: 'black',
              fontFamily: consts.font_family,
              fontSize: consts.font_size * 1.5,
              fontWeight: 'bold',
              content: filling.elm,
              position: filling.path.interiorPoint.subtract([consts.font_size, consts.font_size]),
            });
            filling.onClick = this.fillingClick.bind(this, filling);
          }

          // вписываем в размер экрана
          project.zoom_fit();
          bar.cnstr = cnstr;
          this.setState(bar, () => {
            this.rep && Promise.resolve().then(() => {
              const {_obj} = this.rep.props;
              const row = _obj.production.get(0);
              row.characteristic = bar.ox;
              row.elm = bar.cnstr;
              this.rep
                .handleSave()
                .then(() => {
                  this.forceUpdate(() => {
                    this.rep._result.expandAll();
                  });
                });
            });
          });
        }
      });
  }

  fillingClick(filling) {
    if(filling._attr._exclusive) {
      this.barcodeFin(this.state);
    }
    else {
      filling._attr._exclusive = true;
      this.editor.project.draw_fragment({elm: filling.elm});
    }
  }

  registerRep = (el) => {
    this.rep = el;
  };

  render() {
    const {state: {ox, cnstr, full_picture}, props: {classes}, editor} = this;
    const contour = !full_picture && editor && ox && ox.empty && !ox.empty() && editor.project.getItem({cnstr});
    return <WorkPlaceFrame>
      <Grid item sm={12} md={full_picture ? 8 : 5} xl={full_picture ? 9 : 6} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      {!full_picture && <Grid item sm={12} md={3} className={classes.props}>
        {contour && <Locks {...this.state} registerRep={this.registerRep}/>}
      </Grid>}
      <Grid item sm={12} md={4} xl={3} className={classes.props}>
        <div className={classes.workheight}>
          <Props {...this.state} show_spec={false} changeFull={this.changeFull}/>
          {contour && <Flaps {...this.state} contour={contour}/>}
          {contour && <Fillings {...this.state} contour={contour}/>}
        </div>
      </Grid>
    </WorkPlaceFrame>;
  }
}

Glass.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Glass));
