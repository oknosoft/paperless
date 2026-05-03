import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Profiles from './Profiles';

class Welding extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project, constructor}} = this;
    let {cnstr, ox} = bar;
    const {leading_product, leading_elm} = ox;
    let loader = Promise.resolve(ox);
    if(!leading_product.empty() && leading_elm < 0) {
      loader = leading_product.is_new() ? leading_product.load() : Promise.resolve(leading_product);
    }
    loader.then((projectOx) => project.load(projectOx, {custom_lines: full_picture, mosquito: full_picture, redraw: true}))
      .then(() => {
        if(full_picture) {
          return;
        }

        const contour = project.getItem({cnstr});
        if(contour) {

          // рисуем текущий слой
          project.draw_fragment({elm: -cnstr});

          // прячем заполнения и визуализацию
          contour.glasses(true);
          contour.l_visualization.visible = false;

          // показываем номера элементов на палках
          project.l_dimensions.visible = true;
          for(const profile of contour.profiles) {
            if(!profile.elm_type._manager.impost_lay.includes(profile.elm_type)) {
              profile.draw_articles(1);
            }
          }

          // подкрашиваем штульпы
          this.editor.color_shtulps(contour);

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

          this.setState(bar);

        }
      });
  }

  render() {
    const {state: {ox, cnstr, full_picture}, props: {classes}, editor} = this;
    const contour = !full_picture && editor && ox && ox.empty && !ox.empty() && editor.project.getItem({cnstr});
    return <WorkPlaceFrame>
      <Grid item sm={12} md={full_picture ? 9 : 8} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      <Grid item sm={12} md={full_picture ? 3 : 4} className={classes.props}>
        <Props {...this.state} show_spec={false} changeFull={this.changeFull}/>
        {contour && <Profiles {...this.state} contour={contour}/>}
      </Grid>
    </WorkPlaceFrame>;
  }
}

Welding.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};
export default withStyles(withIface(Welding));
