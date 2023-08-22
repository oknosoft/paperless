

module.exports = function lines_availability($p) {
  const {md, doc, classes} = $p;
  md._m.doc.lines_availability = require('./lines_availability');
  require('./DocLines_availability')($p);
  require('./DocLines_availabilityWork_centersRow')($p);
  doc.create('lines_availability', require('./DocLines_availabilityManager')($p));

  // global.$p = $p;
  // doc.lines_availability.get('7514e260-410c-11ee-a0cd-295af39cfb64', 'promise').then((test) => {
  //   global.test = test;
  // });

};
