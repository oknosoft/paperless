import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import connect from './connect';

class Barcode extends React.Component {

  componentDidMount() {
    document.body.addEventListener('keydown', this.props.bodyKeyDown, false);
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.props.bodyKeyDown);
    this.props.onBlur();
  }

  render() {
    const {props} = this;
    return (
      <TextField
        className={props.className}
        value={props.barcode}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onPaste={props.onPaste}
        inputProps={{placeholder: 'Штрихкод'}}
      />
    );
  }
}

Barcode.propTypes = {
  bodyKeyDown: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onPaste: PropTypes.func.isRequired,
  className: PropTypes.string,
  barcode: PropTypes.string,
};


export default connect(Barcode);
