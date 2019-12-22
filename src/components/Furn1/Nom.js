/**
 * Номенклатура текущей створки
 *
 * @module Nom
 *
 * Created by Evgeniy Malyarov on 19.12.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FrmReport from 'metadata-react/FrmReport';
import Typography from '@material-ui/core/Typography';

class Nom extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.rep = $p.rep.materials_demand.create();
    this.rep.production.add({characteristic: props.ox, elm: props.cnstr});
    this.rep.resources = ['qty'];
    this.rep.prepare = this.prepare;
    this.rep.calculate = this.calculate;
    this.rep.complete_list_sorting = props.complete_list_sorting;

    $p.cat.scheme_settings.find_rows({obj: 'rep.materials_demand.specification'}, (scheme) => {
      if(scheme.name.endsWith('furn1')) {
        this.scheme = scheme;
        return false;
      }
    });
  }

  prepare(scheme) {
    const {specification: data, production, complete_list_sorting} = this;
    return Promise.resolve()
      .then(() => {
        const {characteristic: {specification, coordinates}, elm: cnstr} = this.production.get(0);
        specification.forEach((row) => {
          // в этом месте можно устроить фильтр, передав в компонент массив чисел complete_list_sorting
          if(!row.len && row.nom.complete_list_sorting >= complete_list_sorting[0] && row.nom.complete_list_sorting <= complete_list_sorting[1]) {
            if(row.elm === -cnstr || coordinates.find({elm: row.elm, cnstr})) {
              data.add(row);
            }
          }
        });
        data.group_by(['nom'], ['qty', 'totqty']);
        const nmgr = $p.cat.nom;
        data._obj.sort((a, b) => {
          const na = nmgr.get(a.nom), nb = nmgr.get(b.nom);
          if (na.name < nb.name){
            return -1;
          }
          else if (na.name > nb.name){
            return 1;
          }
          return 0;
        });
      });
  }

  calculate() {
    const {specification: data, scheme, _manager} = this;
    // чистим таблицу результата
    data.clear();
    if(!data._rows) {
      data._rows = [];
    }
    else {
      data._rows.length = 0;
    }

    return this.prepare(scheme)
      .then(() => {

        // фильтруем результат с учетом разыменования и видов сравнения
        //scheme.filter(data, '', true);

        // группируем по схеме - сворачиваем результат и сохраняем его в ._rows
        scheme.group_by(data);

      });
  }

  render() {
    const {ox, cnstr, registerRep} = this.props;
    const row = ox && cnstr && ox.constructions.find({cnstr});
    return this.scheme ?
      [
        <Typography key="cnstr" variant="h6" component="span">{`№${cnstr} `}</Typography>,
        <Typography key="flap" variant="subtitle2" component="span">{row && row.furn.name}</Typography>,
        <FrmReport
          key="report"
          _mgr={this.rep._manager}
          _obj={this.rep}
          _tabular="specification"
          scheme={this.scheme}
          _acl={'r'}
          //autoexec
          ignoreTitle
          hideToolbar
          hideHeader
          registerRep={registerRep}
          cnstr={cnstr}
          minHeight={430}
        />
      ]
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "rep.materials_demand.specification", name: "materials_demand.specification.furn1"}`}
      </Typography>;
  }

}

Nom.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
  complete_list_sorting: PropTypes.array.isRequired,
};

export default Nom;
