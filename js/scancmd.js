/**
 * триггеры спецштрихкодов
 * если получен штрихкод формата {scancmd + № команды}, например: scancmd0001,
 * вместо отправки запроса на сервер, будет выполнена функция из поля "1" объекта $p.scancmd
 */

/**
 * здесь же, располагаем код триггеров событий безбумажки и при необходимости,
 * код поддержки подключенных в 1С обработок безбумажки, например, обработчики нажатий на кнопки регистрации
 */


$p.scancmd = function ScanCMD(){};
$p.scancmd.toString = function(){return "Триггеры безбумажки"};

$p.scancmd[1] = function(){
	$p.msg.show_msg({
		type: "alert-warning",
		text: "Вызван метод №1",
		title: "Спецштрихкод"})
};

$p.scancmd[2] = function(){
	$p.msg.show_msg({
		type: "alert-warning",
		text: "Вызван метод №2",
		title: "Спецштрихкод"})
};

/**
 * Обработчик при загрузке страницы
 * Здесь можно переопределить режим, значения параметров и действие по умолчанию
 * @param p {Object} - см. prepare_prms в модуле wnd_main.js
 * @returns {boolean} - если false - стандартная обработка не выполняется
 */
$p.scancmd.on_load = function(p){

	// для примера, реализован выбор режима по параметру url
	// http://paperless/?mode=0 или http://paperless/?mode=1
	if($p.job_prm.url_prm["mode"]){
		if(p.tmp[$p.job_prm.url_prm["mode"]])
			p.current_mode = p.tmp[$p.job_prm.url_prm["mode"]];
	}
};

/**
 * Обработчик перед обработкой запроса
 * Например, для изменения видимости или поведения стандартных элементов управления
 * @param iface
 * @param prm
 * @param v
 */
$p.scancmd.before_process_message = function(iface, prm, v){

	// для примера, скроем поле ввода заказа для режима "обзор задания"
	if(v.current_mode["ИмяОбработки"] == "paperless_view_task"){
		if(iface.combo_order.isVisible()){
			v.current_order = "";
			iface.combo_order.setComboText("");
			iface.combo_order.unSelectOption();
			iface.combo_order.clearAll();
			iface.combo_order.hide();
			iface.label_order.style.display = "none";
		}

	}else{
		if(!iface.combo_order.isVisible()){
			iface.combo_order.show();
			iface.label_order.style.display = "";
		}

	}

	// эмулируем наличие штрихкода для обработки "план пвх", чтобы отрисовывалось при открытии
	if(v.current_mode["ИмяОбработки"] == "paperless_plan_pvc")
		prm.s = "0";
};

/**
 * Обработчик перед отправкой запроса в 1С
 * можно изменить структуры $p.scancmd.prm и $p.scancmd.v
 * @returns {boolean} - если false - стандартная обработка не выполняется
 */
$p.scancmd.before_send_request = function(){

	// для примера, откажемся от обработки, если штрихкод начинается на "znn"
	if($p.scancmd.prm.s.substring(0,3) == "znn"){
		$p.scancmd.v.current_mode["Ячейка"] = $p.scancmd.prm.s;
		return false;
	}

	// вариант стандартизации спецштрихкодов с префиксом "scancmd"
	if($p.scancmd.prm.s.toLowerCase().indexOf("scancmd")!=-1) {
		var cmd = Number($p.scancmd.prm.s.substr(7));
		if (cmd && !isNaN(cmd))
			cmd = $p.scancmd[cmd];
		if (!cmd || typeof cmd !== "function")
			cmd = $p.scancmd[$p.scancmd.prm.s.substr(7)];

		if (typeof cmd === "function")
			return cmd();
	}
};

/**
 * Обработчик нажатий на пользовательские кнопки
 * @param name {String}
 */
$p.scancmd.head_btn_click = function(name){
	var old_variant;
	if(name == "btn_register"){
		old_variant = $p.scancmd.v.current_mode["Вариант"];
		$p.scancmd.v.current_mode["Вариант"] = "Регистрация";
		$p.scancmd.prm.s = this.getUserData(name, "Штрихкод");
		$p.scancmd.process_message();
		$p.scancmd.v.current_mode["Вариант"] = old_variant;
	}
};

/**
 * Обработчик изменения значений полей ввода формы
 * @param name {String} - имя поля формы
 * @param value {*} - значение поля
 * @param state {Boolean} -	checked/unchecked (for checkboxes and radios only )
 */
$p.scancmd.head_input_change = function(name, value, state){
	var old_variant = $p.scancmd.v.current_mode["Вариант"];
	$p.scancmd.v.current_mode["Вариант"] = name;
	$p.scancmd.v.current_mode["Значение"] = value;
	$p.scancmd.prm.s = this.getUserData(name, "Штрихкод");
	$p.scancmd.process_message();
	delete $p.scancmd.v.current_mode["Значение"];
	$p.scancmd.v.current_mode["Вариант"] = old_variant;
};


/**
 * Отрубить фурнитуру - отправляет relay вебсокет запрос на станок
 * @param size1 {Number} - первый размер
 * @param [size2] {Number} - второй размер, если надо рубить два раза
 *
 * старая версия с вебсокетом
 $p.scancmd.do_furn_cut = function(size1, size2){

 function RelayClient(config, handler) {
 var connected = false,
 connectHandler = handler,
 sckt = new WebSocket(config.relayURL);

 sckt.onopen = function() {
 sckt.send('open ' + config.remoteHost + ' ' + config.remotePort);
 };

 sckt.onmessage = function(event) {
 if (!connected && event.data == 'connected') {
 connected = true;
 handler(sckt);
 }
 }
 }

 var config = {
 relayURL: "ws://phantom:8080",
 remoteHost: "192.168.20.181",
 remotePort: 53508

 },client = new RelayClient(config,  function(socket) {
 //var send_str = new Blob(['GET / HTTP/1.1\r\n\r\n']);
 var send_str = 'POS1500 %PB ' + size1*10;
 if(size2)
 send_str += ' %PC ' + size2*10;

 socket.send(send_str);
 });
 };
 *
 * новая версия на плоском http */
$p.scancmd.do_furn_cut = function(size1, size2){

	var config = {
		relayURL: $p.wsql.get_user_param("relayURL", "string") || "http://192.168.1.103:8080",  // этот хост и порт должна слушать служба node-relay
		remoteHost: $p.wsql.get_user_param("remoteHost", "string") || "192.168.1.181",       // на этот хост будут транслироваться команды
		remotePort: $p.wsql.get_user_param("remotePort", "number") || 53508,                  // в этот порт будут транслироваться команды
		send_str: "POS1500 %PB " + size1*10 + (size2 ? (" %PC " + size2*10) : "")
	};

	$p.ajax.get(config.relayURL + '?m=' + JSON.stringify(config))
		.then(function (req) {
			//console.log(r.xmlDoc.response);
		}).catch(function (error) {
			console.log(error);
		});

};

/**
 * Метод обработки "План ПВХ" со стороны js
 * @param path
 */
$p.scancmd.paperless_plan_pvc = function(elm, path, is_folder){

	if(!$p.iface.popup)
		$p.iface.popup = new dhtmlXPopup();

	if($p.iface.popup.isVisible())
		$p.iface.popup.hide();

	$p.scancmd.process_message(false, function(prm, v){

		if(prm.m["Метод"] == "Проводник"){
			prm.m["ЭтоПапка"] = true;
			if(path == "..."){
				var pos = prm.m["Вариант"].lastIndexOf('/');
				prm.m["Вариант"] = prm.m["Вариант"].substr(0, pos);
			}else{
				prm.m["Вариант"] += prm.m["Вариант"] ? ('/' + path) : path;
				if(is_folder)
					prm.m["Метод"] = "Проводник";
				else{
					var extention = prm.m["Вариант"].substr(prm.m["Вариант"].lastIndexOf('.')).toLowerCase();
					if(extention.indexOf("xls") == -1){
						prm.m["ЭтоПапка"] = false;
						var pos = prm.m["Вариант"].lastIndexOf('/'),
							fname = pos > 0 ? prm.m["Вариант"].substr(pos+1) : prm.m["Вариант"]
						$p.ajax.get_and_save_blob($p.iface.build_url(), "", fname);
						return false;
					}
					prm.m["Метод"] = "Партии";
				}
			}
		}else if(path == "..."){
			prm.m["Метод"] = "Проводник";
			$p.scancmd.paperless_plan_pvc(path);

		}else {
			if(path.indexOf("СформироватьФайл") == -1){

				// запросим список действий с данным заданием в 1С
				prm.m["Метод"] = "СписокДействий";
				prm.m["Задание"] = path;


				// отправляем запрос в 1С
				$p.ajax.get($p.iface.build_url()).then(function (req) {
					if(req.response){
						$p.iface.popup.attachHTML(req.response);
						$p.iface.popup.show(dhx4.absLeft(elm), dhx4.absTop(elm), elm.offsetWidth, elm.offsetHeight);
					}

				}).catch(function (err) {
					console.log(err);
				});

				// стандартную обработку process_message выполнять не будем
				return false;

			}else{
				prm.m["Метод"] = "СформироватьФайл";
				prm.m["Номенклатура"] = path.substr(17);

				// отправляем запрос в 1С
				$p.ajax.get($p.iface.build_url()).then(function (req) {
					if(req.response){
						prm.m["Метод"] = "Проводник";
						prm.m["Вариант"] = "";
						$p.scancmd.paperless_plan_pvc(elm, req.response, true);
					}

				}).catch(function (err) {
					console.log(err);
				});

			}
		}
	});




};

/**
 * Метод обработки "Обзор задания" со стороны js
 * @param path
 */
$p.scancmd.paperless_view_task = function(path){

};

/**
 * Метод обработки "Обзор СГП" со стороны js
 * @param path
 */
$p.scancmd.paperless_stock = function(path){

};

/**
 * Метод обработки "Остекление" со стороны js
 * @param path
 */
$p.scancmd.paperless_glass = function(path){

};