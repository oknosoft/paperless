/**
 * Рисовалка react
 *
 * @module Editor
 *
 * Created by Evgeniy Malyarov on 23.05.2018.
 */

export default function ($p) {

  $p.Editor = class Editor extends $p.EditorInvisible {

    constructor(canvas) {
      super();
      this._canvas = canvas;
      this.create_scheme();
    }

    canvas_cursor() {

    }
  };
}
