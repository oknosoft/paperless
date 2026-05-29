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

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project, PointText, consts, constructor}} = this;
    let {cnstr, ox} = bar;
    const {leading_product, leading_elm} = ox;
    let loader = Promise.resolve(ox);
    if(!leading_product.empty() && leading_elm < 0) {
      loader = leading_product.is_new() ? leading_product.load() : Promise.resolve(leading_product);
    }
    loader.then((projectOx) => project.load(projectOx, {custom_lines: full_picture, mosquito: full_picture, redraw: true, workplace: 'furn2'}))
      .then(() => {
        if(full_picture) {
          return;
        }

        clearTimeout(project._attr._vis_timer);

        let contour = project.getItem({cnstr});
        if(contour) {
          if(contour.layer) {
            contour = contour.layer;
            cnstr = contour.cnstr;
          }

          // прячем лишние слои
          if(contour.in_virt_layer) {
            project.l_dimensions.clear();
            for(const cnt of project.contours) {
              // прячем заполнения и профили
              for(const item of cnt.profiles.concat(cnt.fillings)) {
                item.visible = false;
              }
              cnt.l_dimensions.clear();
            }
            contour.l_dimensions.redraw(true);
          }
          else {
            for(const cnt of project.contours) {
              if(cnt !== contour && cnt.layer !== contour) {
                cnt.visible = false;
              }
            }
          }

          // прячем заполнения
          for(const glass of contour.fillings) {
            glass.visible = false;
          }

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
          if(contour.in_virt_layer) {
            let bl = contour.layer;
            while (bl.layer && !(bl instanceof constructor.ContourVirtual)) {
              bl = bl.layer;
            }
            project.zoom_fit(bl.bounds.expand(300));
          }
          else {
            project.zoom_fit();
          }

          bar.cnstr = cnstr;
          this.setState(bar, () => {
            this.rep && Promise.resolve().then(() => this.rep.handleSave());
          });
        }
      });
  }

  registerRep = (el) => {
    this.rep = el;
  };

  render() {
    const {state: {ox, full_picture}, props: {classes}, editor} = this;
    const has_ox = !full_picture && editor && ox && ox.empty && !ox.empty();
    return <WorkPlaceFrame>
      <Grid item sm={12} md={full_picture ? 8 : 4} xl={full_picture ? 9 : 6} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      {!full_picture && <Grid item sm={12} md={4} xl={3} className={classes.props}>
        {has_ox && <Noms {...this.state} ref={this.registerRep} classes={classes} editor={editor}/>}
      </Grid>}
      <Grid item sm={12} md={4} xl={3} className={classes.props}>
        <div className={classes.workheight}>
          <Props {...this.state} show_spec={false} changeFull={this.changeFull}/>
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
