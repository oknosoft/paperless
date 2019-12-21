import React from 'react';
import PropTypes from 'prop-types';
import Flap from '../Furn1/Flap';
import Params from '../Props/Params';

class Flaps extends React.Component {
  render() {
    const {ox, cnstr} = this.props;
    return ox.constructions._obj
      .filter(({parent}) => parent === cnstr)
      .map((row) => (
        <Flap key={`flap-${row.cnstr}`}  ox={ox} cnstr={row.cnstr} />
      ));
  }
}

Flaps.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
};

export default Flaps;
