
module.exports = function($p) {
  class DocLines_availabilityWork_centersRow extends $p.classes.TabularSectionRow{
    get work_center(){return this._getter('work_center')}
    set work_center(v){this._setter('work_center',v)}
  }

  $p.DocLines_availabilityWork_centersRow = DocLines_availabilityWork_centersRow;
};
