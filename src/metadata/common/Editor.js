/**
 * Рисовалка react
 *
 * @module Editor
 *
 * Created by Evgeniy Malyarov on 23.05.2018.
 */

import paper from 'paper/dist/paper-core';
import drawer from 'wb-core/dist/drawer';

export default function ($p) {

  // формируем в $p конструктор стандартной рисовалки
  drawer({$p, paper});

  const {EditorInvisible} = $p;

  $p.Editor = class Editor extends EditorInvisible {

    constructor(canvas) {
      super();
      this._canvas = canvas;
      this.create_scheme();
    }

    canvas_cursor() {

    }

    // подкрашивает сторону штульпа
    color_shtulps(contour) {
      const {profiles, contours} = contour;
      if(!contours.length) {
        return;
      }
      const imposts = new Set();
      for(const profile of profiles) {
        const joined = profile.joined_imposts();
        for(const {profile} of joined.inner.concat(joined.outer)) {
          const {orientation} = profile;
          orientation._manager.vert === orientation && imposts.add(profile);
        }
      }
      for(const flap of contours) {
        const {furn_set} = flap.furn;
        if(furn_set.shtulp_kind() === 2 || furn_set.name.toLowerCase().includes('пассив')) {
          for(const profile of flap.profiles) {
            const nearest = profile.nearest(true);
            if(nearest) {
              for(const impost of imposts) {
                if(nearest === impost) {
                  const subpath = impost.cnn_side(profile) == 'Снаружи' ?
                    impost.rays.outer.get_subpath(impost.corns(1), impost.corns(2)).equidistant(-6)
                    :
                    impost.rays.inner.get_subpath(impost.corns(3), impost.corns(4)).equidistant(-6);
                  subpath.parent = impost;
                  subpath.strokeWidth = 4;
                  subpath.strokeColor = 'green';
                  subpath.strokeCap = 'round';
                  subpath.strokeScaling = false;
                  subpath.dashArray = [6, 8];
                  break;
                }
              }
            }
          }
        }
      }
    }

  };
}
