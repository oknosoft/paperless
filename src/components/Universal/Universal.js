import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import Builder from '../Builder';
import Props from '../Props/Main';
import withStyles, {WorkPlace, WorkPlaceFrame} from '../App/WorkPlace';

function filter(row) {
  const {param} = row;
  return param.predefined_name !== 'auto_align' && (!param.is_calculated || param.show_calculated);
}

class Universal extends WorkPlace {

  barcodeFin(bar) {
    const {state: {full_picture}, editor: {project}} = this;
    const {ox} = bar;
    project.load(ox, {auto_lines: false, custom_lines: true, unfolding: !full_picture, redraw: true})
      .then(() => {
        clearTimeout(project._attr._vis_timer);
        project.zoom_fit();
        this.setState(bar);
      });
  }

  render() {
    const {state: {full_picture, ox}, props: {classes}} = this;
    return <WorkPlaceFrame>
      <Grid item sm={12} md={full_picture ? 7 : 8} className={classes.workplace}>
        <Builder registerChild={this.registerEditor}/>
      </Grid>
      {ox?.empty && !ox.empty?.() ?
      <Grid item sm={12} md={full_picture ? 5 : 4} className={classes.props}>
        <Props {...this.state} show_spec={false} changeFull={this.changeFull} filter={filter}/>
      </Grid> : null}
    </WorkPlaceFrame>;
  }
}

Universal.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(withIface(Universal));
