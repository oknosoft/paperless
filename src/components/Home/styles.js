export default function (theme) {
  return {
    root: {
      flex: '1 0 100%',
    },
    hero: {
      minHeight: '90vh', // Makes the hero full height until we get some more content.
      flex: '0 0 auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      // backgroundColor: theme.palette.type === 'light' ? theme.palette.primary[500] : theme.palette.primary[800],
      // color: theme.palette.getContrastText(theme.palette.primary[500]),
    },
    content: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      [theme.breakpoints.up('sm')]: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
      },
    },
    text: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },
    headline: {
      maxWidth: 500,
      textAlign: 'center',
    },
    button: {
      marginTop: theme.spacing(3),
    },
    logo: {
      margin: '20px 0',
      width: '100%',
      height: '20vw',
      maxHeight: 120,
    },
  };
}
