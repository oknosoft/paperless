import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Profiles from './Profiles';
import onlay_sizes from './onlay_sizes';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Falsebinding extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project, PointText, consts, constructor: {DimensionLineCustom}}} = this;
    return super.barcodeFin(bar)
      .then(({cnstr, elm, ox}) => {
        if(!ox.coordinates.count() && elm && !ox.leading_product.empty()) {
          const crow = ox.leading_product.coordinates.find({elm});
          if(crow) {
            ox = bar.ox = ox.leading_product;
            cnstr = bar.cnstr = crow.cnstr;
          }
        }
        project.load(ox, {custom_lines: full_picture, mosquito: full_picture, rounding: 1, redraw: true})
          .then(() => {
            if(full_picture) {
              return;
            }

            const contour = project.getItem({cnstr});
            if(contour) {
              // рисуем текущий слой
              project.draw_fragment({elm: -cnstr});

              // прячем вложенные слои и заполнения без раскладок
              for(const cnt of contour.contours) {
                cnt.visible = false;
              }
              for(const filling of contour.fillings) {
                const {imposts} = filling;
                if(!imposts.length) {
                  filling.visible = false;
                  continue;
                }
                filling._attr._text.visible = false;
                onlay_sizes({imposts, consts, PointText});
              }

              // прячем направление открывания и пользовательские размерные линии
              const {l_visualization: {_opening}, l_dimensions} = contour;
              if(_opening) {
                _opening.visible = false;
              }
              l_dimensions.children
                .filter((dim) => dim instanceof DimensionLineCustom)
                .forEach((dim) => dim.remove());

              // рисуем направления профилей
              // for (const profile of contour.profiles) {
              //   profile.mark_direction();
              // }

              // рисуем спецразмеры фальшпереплёта
              contour.l_dimensions.draw_by_falsebinding();

              // и длины элементов раскладок

              // вписываем в размер экрана
              project.zoom_fit();
              this.setState(bar);
            }
          });
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
        <Props ox={ox} cnstr={0} show_spec={false} changeFull={this.changeFull}/>
        {contour && <Profiles {...this.state} contour={contour}/>}
      </Grid>
    </WorkPlaceFrame>;
  }
}

Falsebinding.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Falsebinding));

