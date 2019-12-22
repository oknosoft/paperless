import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

class Imposts extends WorkPlace {

  onBarcode(barcode) {
    super.onBarcode(barcode)
      .then((bar) => {
        if(!bar) {
          return;
        }
        const {project} = this.editor;
        const {cnstr, ox} = bar;
        project.load(ox, {auto_lines: false, custom_lines: false, mosquito: false})
          .then(() => {
            const contour = project.getItem({cnstr});
            if(contour) {
              // рисуем текущий слой
              project.draw_fragment({elm: -cnstr});
              // прячем заполнения
              contour.glasses(true);
              // рисуем спецразмеры импостов
              contour.l_dimensions.draw_by_imposts();
              // подкрашиваем штульпы
              this.editor.color_shtulps(contour);
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
    const {classes} = this.props;
    return <WorkPlaceFrame>
      <Grid item sm={12} lg={8} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      <Grid item sm={12} lg={4} className={classes.props}>
        <Props {...this.state} show_spec={false}/>
      </Grid>
    </WorkPlaceFrame>;
  }
}

Imposts.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Imposts));
