/**
 * Абстрактное рабочее место
 *
 * @module WorkPlace
 *
 * Created by Evgeniy Malyarov on 15.12.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';
import Grid from '@material-ui/core/Grid';
import withStyles from '@material-ui/core/styles/withStyles';
import {item_props} from './menu';
import {decrypt} from '../Barcode/connect';


export class WorkPlace extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.editor = null;
    this.onBarcode = this.onBarcode.bind(this);
    this.shouldComponentUpdate(props);
    this.state = {
      ox: {},
      cnstr: 1,
      full_picture: false,
    };
  }

  changeFull = () => {
    const {cnstr, ox, full_picture} = this.state;
    (ox.coordinates.count() ? Promise.resolve() : ox.load())
      .then(() => this.setState({full_picture: !full_picture}, () => {
        this.barcodeFin({cnstr, ox});
      }));
  };

  onBarcode(barcode) {
    return new Promise((resolve) => this.setState({full_picture: false}, resolve))
      .then(() => this.editor && decrypt(barcode))
      .then((bar) => (
        bar && this.barcodeFin(bar)
      ))
      .catch((err) => {
        const {message} = err;
        const {ox} = this.state;
        if(ox && ox.unload) {
          ox.unload();
        }
        const {project, PointText} = this.editor;
        project.clear();
        project.l_connective.visible = true;
        new PointText({
          parent: project.l_connective,
          name: 'text',
          justification: 'left',
          fillColor: 'black',
          content: `Ошибка штрихкода '${barcode}'`,
          fontSize: 120,
          point: [-300, 80],
        });
        if(message) {
          new PointText({
            parent: project.l_connective,
            name: 'text',
            justification: 'left',
            fillColor: 'black',
            content: message,
            fontSize: 70,
            point: [-300, 200],
          });
        }
        project.zoom_fit();
        this.setState({ox: {}});
      });
  }

  barcodeFin() {
  }

  shouldComponentUpdate({handleIfaceState, title}) {
    const iprops = item_props();
    if(iprops.text && title != iprops.text) {
      handleIfaceState({
        component: '',
        name: 'title',
        value: iprops.text,
      });
      return false;
    }
    return true;
  }

  componentDidMount() {
    $p.md.on('barcode', this.onBarcode);
  }

  componentWillUnmount() {
    $p.md.off('barcode', this.onBarcode);
  }

  registerEditor = (el) => {
    this.editor = el;
  };
}

WorkPlace.propTypes = {
  title: PropTypes.string,
  handleIfaceState: PropTypes.func.isRequired,
};

export function WorkPlaceFrame({children}) {
  const iprops = item_props();
  return <Grid container>
    <Helmet title={iprops.text}>
      <meta name="description" content={iprops.title}/>
    </Helmet>
    {children}
  </Grid>;
}

WorkPlaceFrame.propTypes = {
  children: PropTypes.node.isRequired,
};

function styles(theme) {
  return {
    workplace: {
      minHeight: 'calc(100vh - 50px)', // Makes the hero full height until we get some more content.
    },
    workheight: {
      height: 'calc(100vh - 72px)',
      overflow: 'auto'
    },
    props: {
      paddingTop: theme.spacing(2),
    }
  };
}

export default withStyles(styles);
