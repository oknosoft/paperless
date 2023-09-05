module.exports = function($p) {

  class DocLines_availabilityManager extends $p.classes.DocManager {

    /**
     * Возвращает на дату и подразделение
     * @param {Date} date
     */
    by_date(date, department) {
      this.adapter.find_rows(this, {
        _mango: true,
        _top: 1,
        //date: {$lte: }
        department: department.valueOf()
      })
        .then((rows) => {

        });
    }
  }

  return DocLines_availabilityManager;
};
