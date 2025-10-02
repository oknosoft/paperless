import React from 'react';
import Typography from '@material-ui/core/Typography';
import Coordinates from './Coordinates';

export default function Profile({ox, elm, profile}) {

  return profile ? <>
    <Typography>{`${profile.nom.name} ${profile.info}`}</Typography>
    <Coordinates ox={ox} elm={elm}/>
  </> : null;
}
