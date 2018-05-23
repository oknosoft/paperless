// @flow

import React from 'react';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';

export default class Builder extends React.Component {

  createEditor(el, width, height){
    if(el) {
      if(this.editor && this.editor._canvas === el) {
        this.editor.project.resize_canvas(width, height);
      }
      else {
        this.editor = new $p.Editor(el);
        this.props.registerChild(this.editor);
      }
    }
  }

  render() {
    return <AutoSizer>
      {({width, height}) => {
        if(width < 400) {
          width = 400;
        }
        else {
          width -= 4;
        }
        if(height < 300) {
          height = 300;
        }
        else {
          height -= 4;
        }
        return <canvas
          ref={(el) => this.createEditor(el, width, height)}
          width={width}
          height={height}
        />;
      }}
    </AutoSizer>;
  }
}

Builder.propTypes = {
  registerChild: PropTypes.func.isRequired,
};
