/**
 * Копирует dev-версию файлов в node_modules (для отладки библиотек)
 */

const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const github = 'https://raw.githubusercontent.com/oknosoft/windowbuilder/master/';
const localSrc = path.resolve(__dirname, '../src');

fetch(github + 'public/dist/drawer.js')
  .then(res => {
    const dest = fs.createWriteStream(path.resolve(localSrc, './public/lib/drawer.js'));
    res.body.pipe(dest);
    return fetch(github + 'src/metadata/init.js')
  })
  .then(res => {
    const dest = fs.createWriteStream(path.resolve(localSrc, './metadata/init.js'));
    res.body.pipe(dest);
  })
  .then(() => {
    console.log(`all done`);
  })
  .catch((err) => {
    console.error(err)
  });
