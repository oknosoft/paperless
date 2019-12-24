import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Profiles from './Profiles';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Falsebinding extends WorkPlace {

  onBarcode(barcode) {
    super.onBarcode(barcode)
      .then((bar) => {
        if(!bar) {
          return;
        }
        const {project, PointText, consts, constructor: {DimensionLineCustom}} = this.editor;
        const {cnstr, ox} = bar;
        project.load(ox, {custom_lines: false, mosquito: false})
          .then(() => {
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
                for(const onlay of imposts) {
                  const {generatrix: gen} = onlay;
                  const position = gen.getNearestPoint(onlay.interiorPoint());
                  const offset = gen.getOffsetOf(position);

                  const text = new PointText({
                    parent: onlay,
                    guide: true,
                    justification: 'center',
                    fillColor: 'black',
                    fontFamily: consts.font_family,
                    fontSize: consts.font_size,
                    content: onlay.length.round(),
                    position,
                  });
                  text.translate(gen.getNormalAt(offset).multiply(consts.font_size * 0.7));
                  text.rotate(gen.getTangentAt(offset).angle);
                }
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

  render() {
    const {state: {ox, cnstr}, props: {classes}, editor} = this;
    const contour = editor && ox && ox.empty && !ox.empty() && editor.project.getItem({cnstr});
    return <WorkPlaceFrame>
      <Grid item sm={12} lg={8} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      <Grid item sm={12} lg={4} className={classes.props}>
        <Props ox={ox} cnstr={0} show_spec={false}/>
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

