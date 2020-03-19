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
        this.editor = window.paper = new $p.Editor(el);
        this.props.registerChild(this.editor);
      }
    }
    this.editor && this.props.registerChild(this.editor);
  }

  componentWillUnmount() {
    if(this.editor) {
      window.paper = null;
      this.editor.unload();
      this.props.registerChild(this.editor = null);
    }
  }

  render() {
    const {editor} = this;
    let note;
    if(editor) {
      const {note: n, calc_order_row} = editor.project.ox;
      note = n || (calc_order_row && calc_order_row.note);
    }
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
        if(note) {
          height -= 32;
        }
        return [
          <canvas
            key="canvas"
            ref={(el) => this.createEditor(el, width, height)}
            width={width}
            height={height}
          />,
          note && <div key="note" style={{height: 32}}>
            <div style={{
              color: '#900',
              width,
              bottom: 4,
              paddingLeft: 8,
              fontSize: 'large',
              position: 'absolute',
            }}>{note}</div>
          </div>,
        ];
      }}
    </AutoSizer>;
  }
}

Builder.propTypes = {
  registerChild: PropTypes.func.isRequired,
};
