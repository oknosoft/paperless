import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Profiles from './Profiles';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Arc extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor} = this;
    const {project, constructor: {DimensionRadius, Filling}} = editor;
    const {cnstr, elm, ox} = bar;
    ox.coordinates.clear({elm_type: ''});

    project.load(ox, {auto_lines: full_picture, custom_lines: full_picture, mosquito: full_picture})
      .then(() => {
        if(full_picture) {
          return;
        }

        const contour = project.getItem({cnstr});
        if(contour) {

          // для заполнений отдельная ветка
          const item = elm && editor.elm(elm);
          if(item instanceof Filling) {
            project._attr._builder_props.auto_lines = true;
            project.draw_fragment({elm});
            item.draw_arcr();
          }
          else {
            // рисуем текущий слой
            project.draw_fragment({elm: -cnstr});

            // прячем заполнения
            contour.glasses(true);

            // рисуем спецразмеры импостов
            contour.l_dimensions.draw_by_imposts();

            // подкрашиваем штульпы
            editor.color_shtulps(contour);
            const {_by_spec, _opening} = contour.l_visualization;
            _by_spec.opacity = 0.4;
            if(_opening) {
              _opening.opacity = 0.4;
            }

            // расставляем радиусы на гнутых элементах
            contour.l_dimensions.children
              .filter((dim) => dim instanceof DimensionRadius)
              .forEach((dim) => {
                dim.remove();
              });

            // показываем номера элементов на палках
            for(const profile of contour.profiles) {
              if(!profile.elm_type._manager.impost_lay.includes(profile.elm_type)) {
                profile.show_number();
              }
              if(!profile.is_linear()) {
                const {generatrix: gen, rays: {outer}, path} = profile;
                const p0 = gen.getPointAt(gen.length * 0.7);
                const p1 = path.getNearestPoint(outer.getNearestPoint(p0));
                const dr = new DimensionRadius({
                  elm1: profile,
                  p1: path.getOffsetOf(p1).round(),
                  parent: contour.l_dimensions,
                  by_curve: false,
                  ref: `r-${profile.elm}`,
                });
                dr.redraw();
              }
            }
          }

          // вписываем в размер экрана
          project.zoom_fit();
          this.setState(bar);
        }
      });
  }

  render() {
    const {state: {ox, cnstr, full_picture}, props: {classes}, editor} = this;
    const contour = !full_picture && editor && ox && ox.empty && !ox.empty() && editor.project.getItem({cnstr});
    return <WorkPlaceFrame>
      <Grid item sm={12} md={full_picture ? 9 : 7} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      <Grid item sm={12} md={full_picture ? 3 : 5} className={classes.props}>
        <Props ox={ox} cnstr={0} show_spec={false} changeFull={this.changeFull}/>
        {contour && <Profiles {...this.state} contour={contour}/>}
      </Grid>
    </WorkPlaceFrame>;
  }
}

Arc.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Arc));
