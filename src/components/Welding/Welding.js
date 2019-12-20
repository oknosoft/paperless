import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import AppContent from 'metadata-react/App/AppContent';
import {item_props} from '../App/menu';
import withStyles, {WorkPlace} from '../App/WorkPlace';

import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Profiles from './Profiles';

class Welding extends WorkPlace {

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

              // рисуем текущий слой
              project.draw_fragment({elm: -cnstr});

              // прячем заполнения и визуализацию
              contour.glasses(true);
              contour.l_visualization.visible = false

              // показываем номера элементов на палках
              for(const profile of contour.profiles) {
                if(!profile.elm_type._manager.impost_lay.includes(profile.elm_type)) {
                  profile.show_number();
                }
              }

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
    const iprops = item_props();
    const contour = editor && ox && ox.empty && !ox.empty() && editor.project.getItem({cnstr});
    return <Grid container>
      <Helmet title={iprops.text}>
        <meta name="description" content={iprops.title}/>
      </Helmet>
      <Grid item sm={12} lg={8} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      <Grid item sm={12} lg={4} className={classes.props}>
        <Props {...this.state} show_spec={false}/>
        {contour && <Profiles {...this.state} contour={contour}/>}
      </Grid>
    </Grid>;
  }
}

Welding.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};
export default withStyles(withIface(Welding));
