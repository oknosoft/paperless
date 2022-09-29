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

  const {Filling, DimensionRadius, ProfileItem} = EditorInvisible;
  Filling.prototype.draw_arcr = function draw_arcr () {
    const {profiles, l_dimensions, elm} = this;
    for(const {sub_path} of profiles) {
      if(sub_path.length > 50 && !sub_path.is_linear()) {
        const p0 = sub_path.getPointAt(sub_path.length * 0.66);
        const dr = new DimensionRadius({
          elm1: {
            path: sub_path,
            length: sub_path.length,
            _attr: {
              _corns: [null, sub_path.firstSegment.point, sub_path.lastSegment.point],
            }
          },
          p1: sub_path.getOffsetOf(p0).round(),
          parent: l_dimensions,
          by_curve: false,
          ref: `r-${elm}`,
        });
        dr.redraw();
      }
    }
  };

  ProfileItem.prototype.crackers_dimensions = function crackers_dimensions() {
    const {layer: {l_dimensions, l_visualization}, rays, width}  = this;
    const {b, e} = rays;
    const {inner, outer} = this.joined_imposts();
    const profiles = [b, ...inner, ...outer, e];
    for(const {profile, point} of profiles) {
      // определим сторону
      const side = this.cnn_side(profile, null, rays);
      const ray = side.is('inner') ? rays.inner : rays.outer;
      const ipoint = ray.intersect_point(profile.generatrix, point, width);
      if(ipoint) {
        const offset = ray.getOffsetOf(ipoint);
        const normal = ray.getNormalAt(offset).multiply(width * .8);
        const segments = [ipoint, ipoint.add(normal.rotate(30)), ipoint.add(normal.rotate(-30))];
        new paper.Path({
          segments,
          closed: true,
          strokeColor: 'black',
          strokeScaling: false,
        });

      }
    }
  };
}
