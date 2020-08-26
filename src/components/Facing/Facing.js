import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import Profiles from '../Falsebinding/Profiles';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';
import onlay_sizes from '../Falsebinding/onlay_sizes';

class Facing extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project, consts, PointText, constructor: {Filling, BuilderElement}}} = this;
    const {cnstr, elm, ox} = bar;
    project.load(ox, {custom_lines: full_picture, mosquito: full_picture, rounding: 1})
      .then(() => {
        if(full_picture) {
          for(const contour of project.contours) {
            for(const filling of contour.fillings) {
              filling.onClick = this.fillingClick.bind(this, filling);
            }
          }
          return;
        }

        let filling, contour;

        if(elm) {
          filling = project.getItem({class: BuilderElement, elm});
          if(filling instanceof Filling) {
            contour = filling && filling.layer;
            bar.cnstr = contour.cnstr;
          }
          else {
            filling = null;
          }
        }

        if(!filling) {
          contour = project.getItem({cnstr});
          if(contour) {
            const {fillings} = contour;
            if(fillings.length) {
              filling = fillings[0];
              bar.elm = filling.elm;
            }
          }
        }

        if(contour && filling) {
          filling._attr._exclusive = true;
          filling._attr._text.visible = false;
          filling.onClick = this.fillingClick.bind(this, filling);
          onlay_sizes({imposts: filling.imposts, consts, PointText});

          // рисуем текущий слой
          project.draw_fragment({elm: bar.elm});
          filling.draw_arcr();

          // вписываем в размер экрана
          project.zoom_fit();
          this.setState(bar);
        }
      });
  }

  fillingClick(filling) {
    if(filling._attr._exclusive) {
      this.changeFull();
    }
    else {
      const bar = Object.assign({}, this.state, {elm: filling.elm, full_picture: false});
      this.setState(bar, () => this.barcodeFin(bar));
    }
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

Facing.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Facing));


