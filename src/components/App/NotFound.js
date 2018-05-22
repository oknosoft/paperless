// @flow

import React from 'react';
import Typography from '@material-ui/core/Typography';

export default function Page() {
  return [
    <Typography key="title" variant="title" component="h1" color="inherit" noWrap>404</Typography>,
    <Typography key="text" color="inherit">Страница не найдена</Typography>
  ];
}
