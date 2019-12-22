import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Flaps from './Flaps';
import Noms from './Noms';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Furn2 extends WorkPlace {

  onBarcode(barcode) {
    super.onBarcode(barcode)
      .then((bar) => {
        if(!bar) {
          return;
        }
        const {project, PointText, consts} = this.editor;
        let {cnstr, ox} = bar;
        project.load(ox, {custom_lines: false, mosquito: false})
          .then(() => {
            let contour = project.getItem({cnstr});
            if(contour) {
              if(contour.layer) {
                contour = contour.layer;
                cnstr = contour.cnstr;
              }
              // прячем лишние слои
              for(const cnt of project.contours) {
                if(cnt !== contour && cnt.layer !== contour) {
                  cnt.visible = false;
                }
              }
              // прячем заполнения
              for(const glass of contour.fillings) {
                glass.visible = false;
              };
              // рисуем номер слоя
              for(const cnt of contour.contours) {
                new PointText({
                  parent: cnt,
                  guide: true,
                  justification: 'center',
                  fillColor: 'darkblue',
                  fontFamily: consts.font_family,
                  fontSize: consts.font_size * 2,
                  fontWeight: 'bold',
                  content: cnt.cnstr,
                  position: cnt.bounds.center,
                });
              }
              // вписываем в размер экрана
              project.zoom_fit();
              bar.cnstr = cnstr;
              this.setState(bar, () => {
                this.rep && Promise.resolve().then(() => this.rep.handleSave());
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
        {has_ox && <Noms {...this.state} ref={this.registerRep} classes={classes}/>}
      </Grid>
      <Grid item sm={12} lg={3} className={classes.props}>
        <div className={classes.workheight}>
          <Props {...this.state} show_spec={false}/>
          {has_ox && <Flaps {...this.state}/>}
        </div>
      </Grid>
    </WorkPlaceFrame>;
  }
}

Furn2.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Furn2));
