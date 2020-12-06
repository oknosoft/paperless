/**
 * Штапики текущих заполнений
 *
 * @module Locks
 *
 * Created by Evgeniy Malyarov on 29.12.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FrmReport from 'metadata-react/FrmReport';
import Typography from '@material-ui/core/Typography';

function numberFormatter(digits) {
  function NFormatter ({value}) {
    if(!value) return '';
    if(typeof value !== 'number') {
      value = parseFloat(value, 10);
    }
    const text = value.toFixed(digits);
    return <div title={text} style={{textAlign: 'right'}}>{text}</div>;
  }
  NFormatter.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  };
  return NFormatter;
}

class Locks extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, rep, utils} = $p;
    this.rep = rep.materials_demand.create();
    this.rep.production.add({characteristic: props.ox, elm: props.cnstr});
    this.rep.resources = ['qty'];
    this.rep.prepare = this.prepare;
    this.rep.calculate = this.calculate;

    this._meta = utils._clone(this.rep._metadata('specification'));
    this._meta.fields.qty.type.fraction = 0;
    this._meta.fields.len.type.fraction = 1;

    cat.scheme_settings.find_rows({obj: 'rep.materials_demand.specification'}, (scheme) => {
      if(scheme.name.endsWith('locks1')) {
        this.scheme = scheme;
        return false;
      }
    });
  }

  prepare(/*scheme*/) {
    const {specification: data, production} = this;
    return Promise.resolve()
      .then(() => {
        const {characteristic: {specification, coordinates, constructions}} = production.get(0);
        const {Штапик} = $p.enm.elm_types;

        specification.forEach((row) => {
          // в этом месте можно устроить фильтр
          if(!row.elm || !row.len || row.nom.elm_type !== Штапик) {
            return;
          }
          const nrow = data.add(row);
          const crow = constructions.find({cnstr: coordinates.find({elm: row.elm}).cnstr});
          nrow.len *= 1000;
          nrow.grouping = `${crow.parent ? 'Створка' : 'Рама'} №${crow.cnstr}`;
        });
        data.group_by(['grouping', 'nom', 'len'], ['qty']);
        const nmgr = $p.cat.nom;
        data._obj.sort((a, b) => {
          const na = nmgr.get(a.nom), nb = nmgr.get(b.nom);
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

  handleColumns = (columns) => {

    for(const column of columns) {
      if(column.key === 'len') {
        column.formatter = numberFormatter(1);
      }
      else if(column.key === 'qty') {
        column.formatter = numberFormatter(0);
      }
    }
  };

  render() {
    const {props: {registerRep}, scheme, rep} = this;
    const {characteristic: {coordinates}} = rep.production.get(0);
    const false_binding = coordinates.find({elm_type: $p.enm.elm_types.Раскладка});
    return scheme ?
      [
        false_binding && <Typography
          key="false_binding"
          color="error"
          variant="h6"
          component="h2"
        >{false_binding.nom.name}</Typography>,
        <FrmReport
          key="report"
          _tabular="specification"
          _acl="r"
          _mgr={rep._manager}
          _obj={rep}
          _meta={this._meta}
          scheme={scheme}
          read_only
          ignoreTitle
          hideToolbar
          registerRep={registerRep}
          handleColumns={this.handleColumns}
          minHeight={600}
        />
      ]
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "rep.materials_demand.specification", name: "materials_demand.specification.locks1"}`}
      </Typography>;
  }

}

Locks.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
  registerRep: PropTypes.func.isRequired,
};

export default Locks;


