import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Fillings from './Fillings';
import Locks from './Locks';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Glass extends WorkPlace {

  onBarcode(barcode) {
    super.onBarcode(barcode)
      .then((bar) => (
        bar && this.barcodeFin(bar)
      ))
      .catch(({message}) => {
        const {ox} = this.state;
        if(ox && ox.unload) {
          ox.unload();
        }
        this.editor.project.clear();
        this.setState({ox: {}});
      });
  }

  barcodeFin(bar) {
    const {project, PointText, consts} = this.editor;
    let {cnstr, ox} = bar;
    project.load(ox, {custom_lines: false, mosquito: false /*, visualization: false */})
      .then(() => {
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
            this.rep && Promise.resolve().then(() => this.rep.handleSave());
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

  render() {
    const {state: {ox}, props: {classes}, editor} = this;
    const has_ox = editor && ox && ox.empty && !ox.empty();
    return <WorkPlaceFrame>
      <Grid item sm={12} lg={6} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      <Grid item sm={12} lg={3} className={classes.props}>
        {has_ox && <Locks {...this.state}/>}
      </Grid>
      <Grid item sm={12} lg={3} className={classes.props}>
        <div className={classes.workheight}>
          <Props {...this.state} show_spec={false}/>
          {has_ox && <Fillings {...this.state}/>}
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
