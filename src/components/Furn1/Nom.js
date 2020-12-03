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
import furnClr from './furnClr';

class Nom extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, rep, utils} = $p;
    this.rep = rep.materials_demand.create();
    this.rep.production.add({characteristic: props.ox, elm: props.cnstr});
    this.rep.resources = ['qty'];
    this.rep.prepare = this.prepare;
    this.rep.calculate = this.calculate;
    this.rep.complete_list_sorting = props.complete_list_sorting;

    this._meta = utils._clone(this.rep._metadata('specification'));
    this._meta.fields.qty.type.fraction = 0;
    this._meta.fields.totqty.type.fraction = 0;

    cat.scheme_settings.find_rows({obj: 'rep.materials_demand.specification'}, (scheme) => {
      if(scheme.name.endsWith('furn1')) {
        this.scheme = scheme;
        return false;
      }
    });
  }

  prepare(/*scheme*/) {
    const {specification: data, production, complete_list_sorting} = this;
    return Promise.resolve()
      .then(() => {
        const {characteristic: {specification, coordinates}, elm: cnstr} = production.get(0);
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
          if (na.complete_list_sorting < nb.complete_list_sorting){
            return -1;
          }
          if (na.complete_list_sorting > nb.complete_list_sorting){
            return 1;
          }
          if (na.name < nb.name){
            return -1;
          }
          if (na.name > nb.name){
            return 1;
          }
          return 0;
        });
      });
  }

  calculate() {
    const {specification: data, scheme} = this;
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
    const {ox, cnstr, registerRep, count} = this.props;
    const row = ox && cnstr && ox.constructions.find({cnstr});
    const classes = row ? {root: furnClr(row.furn)} : {};
    return this.scheme ?
      [
        <Typography key="cnstr" variant="h6" classes={classes}>{`№${cnstr} (${row && row.furn.name})`}</Typography>,
        <FrmReport
          key="report"
          _tabular="specification"
          _acl="r"
          _mgr={this.rep._manager}
          _obj={this.rep}
          _meta={this._meta}
          scheme={this.scheme}
          read_only
          ignoreTitle
          hideToolbar
          hideHeader
          registerRep={registerRep}
          cnstr={cnstr}
          minHeight={count === 1 ? 680 : 440}
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
  registerRep: PropTypes.func.isRequired,
  count: PropTypes.number,
};

export default Nom;
