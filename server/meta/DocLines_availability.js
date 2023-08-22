module.exports = function($p) {

  class DocLines_availability extends $p.classes.DocObj {
    get work_centers(){return this._getter_ts('work_centers')}
    set work_centers(v){this._setter_ts('work_centers',v)}
  }

  $p.DocLines_availability = DocLines_availability;
};
