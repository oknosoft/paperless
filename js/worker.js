/**
 * Фоновые задачи безбумажки
 * Created 29.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @license content of this file is covered by Oknosoft Commercial license. Usage without proper license is prohibited. To obtain it contact info@oknosoft.ru
 * @author    Evgeniy Malyarov
 * @module  worker
 */

self.addEventListener("message", function(e) {

	importScripts("//oknosoft.github.io/metadata.js/dist/metadata.core.min.js");

	if(e.data.action == "lazy_load"){
		var attr = e.data;
		$p.ajax.get_ex(attr.url, attr)
			.then(function (req) {
				attr.res = JSON.parse(req.response);
				self.postMessage(attr);
			})
			.catch(function (err) {
				;
			})
	}else
		self.postMessage(e.data);

}, false);
