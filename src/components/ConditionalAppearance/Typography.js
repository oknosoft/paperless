import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {useConditionalAppearanceContext} from './context';

export default function TypographyWithAppearance({children, fld, frmKey, ...other}) {
  const context = useConditionalAppearanceContext();
  const scheme = context.findScheme();
  scheme?.conditional_appearance.find_rows({use: true, columns: {in: [fld,'*']}}, (crow) => {
    if(crow.check(context)) {
      if(other.classes) {
        delete other.classes.root;
      }
      try{
        other.style = JSON.parse(crow.css);
      }
      catch(e) {}
      return false;
    }
  });
  return <Typography {...other}>{children}</Typography>;
}

TypographyWithAppearance.propTypes = {
  children: PropTypes.node.isRequired,
  fld: PropTypes.string.isRequired,
  frmKey: PropTypes.string,
};
