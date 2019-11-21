/**
 * Рисовалка react
 *
 * @module Editor
 *
 * Created by Evgeniy Malyarov on 23.05.2018.
 */



export default function ($p) {



  const {EditorInvisible} = $p;
  $p.Editor = class Editor extends EditorInvisible {

    constructor(canvas) {
      super();
      this._canvas = canvas;
      new $p.EditorInvisible.Scheme(this._canvas, this, typeof window === 'undefined');
      //this.create_scheme();
      this.eve.on('coordinates_calculated', this.coordinates_calculated);
      this._canvas.addEventListener('touchstart', this.canvas_touchstart, false);
    }

    coordinates_calculated = () => {
      const {ox, _dp} = this.project;
      _dp._data._silent = true;
      _dp.len = ox.x;
      _dp.height = ox.y;
      _dp._data._silent = false;
    };

    canvas_touchstart = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      const touch = evt.touches.length && evt.touches[0];
      const {view, tool, project: {bounds}} = this;
      const point = view.viewToProject([touch.clientX, touch.clientY]).add([-50, -158]);
      const event = {point, modifiers: {}};
      tool.hitTest(event);
      tool.mousedown(event);
    };

    /**
     * Надевает шаблон на текущее изделие
     * @param base_block {cat.characteristics}
     * @param template {cat.templates}
     */
    apply_template(base_block, template) {

    }

    unload() {
      this.project._dp._manager.off('update');
      this._canvas.removeEventListener("touchstart", this.canvas_touchstart);
      super.unload();
    }

  };

}
