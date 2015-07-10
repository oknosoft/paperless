/**
 * настройки движка безбумажки
 */
$p.settings = function (prm, modifiers) {

	prm.check_browser_compatibility = false;    // совместимость браузера не проверяем
	prm.use_builder =  false;                   // построитель Raphael не используем
	prm.use_wrapper = true;                     // но используем wrapper с главной страницы
	prm.check_app_installed = false;            // проверяем установленность приложения в ChromeStore
	prm.use_google_geo = false;                 // геолокатор не используем
	prm.offline = false;                        // автономная работа запрещена
	prm.additionsl_params = [
		{p: "offline",      v: "", t:"boolean"},
		{p: "relayURL",     v: "http://paperless.local:8080", t:"string"},  // адрес релейного сервиса для фурнитурной станции
		{p: "remoteHost",   v: "cutter.local", t:"string"},                 // адрес рубщика фурнитурной станции
		{p: "remotePort",   v: "53508", t:"number"},
		{p: "pl_hs_url",    v: "/kademo/hs/pl", t:"string"},
		{p: "pl_action",    v: "Фурнитура;;;", t:"string"},
		{p: "pl_variant",   v: "", t:"string"}
	];

};

/**
 * Обработчик события при инициализации интерфейса пользователя
 */
$p.iface.oninit = function() {

	var iface = $p.iface, prm, v;


	iface.build_url = function(){
		return v.url_1c +
			"?s=" + prm.s +
			"&m=" + JSON.stringify(prm.m) +
			"&f=" + prm.f +
			"&browser_uid=" + $p.wsql.get_user_param("browser_uid");
	};


	/**
	 *	@desc: 	перерисовывает экран: обработка штрихкода или команды
	 */
	function process_message(check_s, before_process){

		// отражаем в prm свойства текущего варианта
		if(before_process){
			if(before_process(prm, v) === false)
				return;
		}else{
			if(!v.current_mode)
				return;
			for(var i in v.current_mode){
				prm.m[i] = v.current_mode[i];
			}
			prm.m["Задание"]	= v.current_task;
			prm.m["Расчет"]		= v.current_order;
			prm.m["Продукция"]	= v.current_product;
			prm.m["Подразделение"]	= v.current_division;
			prm.m["Исполнитель"]	= v.current_employee;
		}

		iface.toolbar.setItemText("mode_text", v.current_mode.presentation || "?");

		if($p.scancmd.before_process_message(iface, prm, v) === false)
			return;

		// если заполнен штрихкод, выполняем асинхронные запросы к 1С и фантому
		if(!check_s || prm.s){

			// перед формированием url, выполняем триггер,
			// который может изменить v и prm или решить, что данный штрихкод вообще не надо отправлять на сервер
			if($p.scancmd.before_send_request() === false)
				return;

			function onLoadPhantom(req){
				if(!req || req.status!=200){
					$p.risdiv.innerHTML = "";
					return;
				}
				$p.risdiv.innerHTML = req.response;
			}

			function onLoad1С(req){
				if(!req || req.status!=200)
					return;
				try{
					var response = JSON.parse(req.response);

					// если на стороне 1С сформировано сообщение об ошибке
					// или указание не выполнять стандартную обработку - выходим
					// error_description можно использовать для пользовательских оповещений - не только об ошибках
					if(response["error"] || response["preventDefault"]){
						if((typeof response["error"] == "string" || response["error_description"]))
							$p.msg.show_msg(response["error_description"] || response["error"]);
						return;

					}else if(response["Эскиз"]){
						// если эскиз не прибежал из 1С, формируем его по описанию элементов построителя
						if(typeof response["Эскиз"] == "string"){
							onLoadPhantom({status: 200, response: response["Эскиз"]});

						}else{
							setTimeout(function(){
								$p.ajax.hide_headers = true;
								$p.ajax.post(v.url_phantom, JSON.stringify(response["Эскиз"])).then(onLoadPhantom);
							}, 0);
						}
					}

					setTimeout(function(){
						// шапка
						iface.form_head.clearAll();

						if(response["Шапка"] && response["Шапка"].length){
							iface.form_head.loadStruct(response["Шапка"], function(){

							});
						}

						iface.form_head.forEachItem(function(name){
							if(name.indexOf("calendar_")!=-1){

							}else if(name.indexOf("input_")!=-1){

							}
						});

						// таблица
						iface.grid.parse(response["Таблица"]);
						if(response["Группировать"])
							iface.grid.groupBy(0);

						// подвал
						iface.form_footer.clearAll();

						if(response["Подвал"] && response["Подвал"].length){
							iface.form_footer.loadStruct(response["Подвал"], function(){

							});
						}

						// произвольный скрипт
						if(response["Скрипт"])
							eval(response["Скрипт"]);

					}, 0);


				}catch(e){
					$p.msg.show_msg(e.message);
				}
			}

			// отправляем запрос в 1С
			$p.ajax.get(iface.build_url())
				.then(onLoad1С)
				.catch(function (error) {
					console.log(error);
				});

			prm.s = "";
		}
	}

	/**
	 *	@desc: 	при нажатии клавиши везде, кроме поляввода штрихкодв
	 */
	function wnd_keydown(evt){

		function clear_buffer(){
			prm.s = "";
			v.kb.length = 0;
		}

		if(evt.keyCode == 13) {

			if(v.kb.length < 6 && (evt.target == iface.combo_order.DOMelem_input ||
				evt.target == iface.combo_task.DOMelem_input ||
				evt.target == iface.combo_product.DOMelem_input))
				return;

			if(v.kb.length){
				prm.s = "";
				v.kb.forEach(function(elm){
					if(elm > 30)
						prm.s = prm.s + String.fromCharCode(elm);
				});
				iface.input_barcode.value = prm.s;
				setTimeout(process_message, 0);
			}
		}else if(evt.keyCode == 27 || evt.keyCode == 8 || evt.keyCode == 46){
			clear_buffer();
		}else{
			// сравним время с предыдущим. если маленькое, добавляем в буфер. если большое - пишем последний элемент
			if(evt.timeStamp - v.timeStamp > 100)
				clear_buffer();
			v.timeStamp = evt.timeStamp;
			v.kb.push(evt.keyCode);
		}

		return false;
	}

	/**
	 *	@desc: 	при изменении поля ввода штрихкода
	 */
	function input_change(evt){
		prm.s = iface.input_barcode.value;
		if(prm.s){
			setTimeout(process_message, 0);
			setTimeout(function(){
				iface.input_barcode.value = "";
			}, 100);
		}
		return $p.cancel_bubble(evt);
	}


	/**
	 *	@desc: 	обработчик нажатия кнопок командных панелей
	 */
	function toolbar_click(btn_id){
		if(btn_id=="btn_requery"){

		}else if(btn_id=="btn_new"){

		}else if(btn_id=="btn_edit"){

		}else if(btn_id=="btn_delete"){

		}else if(btn_id.substr(0,4)=="prn_"){

		}else if(btn_id=="btn_more_cfg"){
			window.open("options.html?v="+$p.job_prm.files_date);

		}else if(btn_id=="btn_reg_prm"){
			$p.iface.registration_prm(v);

		}else if(btn_id.indexOf("var_") != -1){
			v.current_mode = v.modes[btn_id];
			process_message();

		}

	}


	function prepare_prms(){

		var getp = $p.wsql.get_user_param,
			pairs = $p.job_prm.url_prm, vtmp,
			p = {
				tmp: getp("pl_variant").split("\n"),
				current_mode: getp("pl_action")
			};

		if($p.scancmd.on_load(p) === false)
			return;

		prm = ($p.prm = {
			s: "",						//	Штрихкод
			m: {						//	Режим
				"ИмяОбработки":	"",		// если пустая строка, используем внутреннюю обработку итНарядыПоЗаданиюНаПроизводство
				// иначе, внешнюю обработку с указанным именем
				"Метод":		"",		// если пустая строка, используем метод PaperLess()
				"Вариант":		"",		// имя варианта по умолчанию
				"Задание":		"",		// идентификатор Задания на производство
				"Расчет":		"",		// идентификатор Расчета
				"Продукция":	"",		// идентификатор Продукции
				"Подразделение":"",		// идентификатор Подразделения
				"Исполнитель":	""		// идентификатор Исполнителя
			},
			f: "json"		//	Формат
		});

		v = {
			url_1c 		:	getp("pl_hs_url"),
			url_phantom	:	getp("phantom_url"),
			kb			:	[],
			timeStamp	:	0,
			modes		:	{},
			current_mode:	null,
			current_division: getp("pl_division") || "",
			current_employee: getp("pl_employee") || ""
		};

		// получим доступные режимы + текущий режим
		for(var i in p.tmp){
			vtmp = p.tmp[i].split(";");
			v.modes["var_" + i] = {
				presentation	:	vtmp[0],
				"ИмяОбработки"	:	vtmp[1],
				"Метод"			:	vtmp[2],
				"Вариант"		:	vtmp[3]
			};
			if(p.current_mode == p.tmp[i])
				v.current_mode = v.modes["var_" + i];
		}
		if(!v.current_mode){
			v.current_mode = v.modes["var_0"];
			$p.wsql.set_user_param("pl_action", p.tmp[0]);
		}

		// параметры url обладают приоритетом над сохраненными настройками
		for (var prm_name in pairs){
			if(!prm.hasOwnProperty(prm_name))
				continue;
			if(prm_name == "m"){
				for (var sub_name in pairs[prm_name])
					prm[prm_name][sub_name] = pairs[prm_name][sub_name];
			}else
				prm[prm_name] = pairs[prm_name];
		}
	}

	// комбинируем параметры url с сохраненными параметрами
	prepare_prms();

	// создаём разметку основного окна
	iface.main = new dhtmlXLayoutObject(document.body, '4I');

	// разрешаем переход - закрытие страницы без вопросов
	$p.eve.redirect = true;

	iface.cheader = iface.main.cells('a');
	iface.cheader.setHeight('110');
	iface.cheader.hideHeader();
	iface.cheader.fixSize(false, true);
	iface.cheader.setCollapsedText("...");
	iface.form_head = iface.cheader.attachForm([]);

	// разъём для подключения внешних обработчиков + ссылки на контекст безбумажки
	iface.form_head.attachEvent("onButtonClick", $p.scancmd.head_btn_click);
	iface.form_head.attachEvent("onChange", $p.scancmd.head_input_change);
	$p.scancmd.process_message = process_message;
	$p.scancmd.prm = prm;
	$p.scancmd.v = v;

	iface.cimage = iface.main.cells('b');
	iface.cimage.setWidth('430');
	iface.cimage.hideHeader();
	iface.cimage.attachObject($p.wrapper);	// располагаем здесь wrapper с канвой Рафаэля

	iface.cgrid = iface.main.cells('c');
	iface.cgrid.hideHeader();
	iface.grid = iface.cgrid.attachGrid();
	iface.grid.setIconsPath(dhtmlx.image_path);
	iface.grid.setImagePath(dhtmlx.image_path);
	iface.grid.enableKeyboardSupport(false);

	iface.cfooter = iface.main.cells('d');
	iface.cfooter.setHeight('100');
	iface.cfooter.hideHeader();
	iface.cfooter.fixSize(false, true);
	iface.form_footer = iface.cfooter.attachForm([]);
	iface.cfooter.setCollapsedText("...");
	iface.cfooter.collapse();

	iface.toolbar = iface.main.attachToolbar();
	iface.toolbar.setIconsPath(dhtmlx.image_path + 'dhxtoolbar_web/');
	iface.toolbar.loadStruct('data/toolbar_pl.xml?v='+$p.job_prm.files_date, function () {

		this.addSpacer("barcode");

		iface.input_barcode = this.getInput("barcode");
		iface.input_barcode.type = 'search';

		var input_parent = iface.input_barcode.parentNode.parentNode,
			txt_label = document.createElement('div');

		txt_label.innerHTML = 'Заказ';
		txt_label.className = "dhx_toolbar_text";
		input_parent.appendChild(txt_label);
		iface.label_order = txt_label;

		iface.combo_order = new dhtmlXCombo(input_parent,"combo_order",122);
		iface.combo_order.DOMelem.classList.add('pl_combo');
		iface.combo_order.load($p.wsql.get_user_param("pl_hs_url") + "/q/combo_order");
		iface.combo_order.enableFilteringMode("between", $p.wsql.get_user_param("pl_hs_url") + "/q/combo_order", false, false);
		//iface.combo_order.allowFreeText(false);
		//iface.combo_order.enableAutocomplete();
		iface.combo_order.attachEvent("onBlur", function(){
			if(!this.getSelectedValue() && this.getComboText())
				this.setComboText("");
		});
		iface.combo_order.attachEvent("onChange", function(){

			var selv = (this.getSelectedValue() || "");

			if(v.current_order == selv)
				return;

			v.current_order = selv;

			iface.combo_product.unSelectOption();
			iface.combo_product.clearAll();

			iface.combo_task.unSelectOption();
			iface.combo_task.clearAll();

			// прочитать картинки расчета и перезаполнить связанные комбобоксы
			$p.ajax.get($p.wsql.get_user_param("pl_hs_url") + "/q/combo_task?order=" + (v.current_order || ""))
				.then(function(req){
					iface.combo_task.load(req.responseText);
				});
			if(v.current_order){
				$p.ajax.get($p.wsql.get_user_param("pl_hs_url") + "/q/order_pics?order="+v.current_order)
					.then(function(req){

						iface.form_head.clearAll();

						var response = JSON.parse(req.response);

						iface.combo_product.load(response["aproducts"]);

						iface.form_head.loadStruct([{type:"container", name:"head_svgs"}], function(){
							var head_svgs = iface.form_head.getContainer("head_svgs");
							iface.form_head.cont.style.overflow = "hidden";
							head_svgs.style.marginTop = "-8px";
							head_svgs.innerHTML = response["asvgs"];


						});
					})
					.then(process_message);
			}
		});


		txt_label = document.createElement('div');
		txt_label.innerHTML = 'Изделие';
		txt_label.className = "dhx_toolbar_text";
		input_parent.appendChild(txt_label);

		iface.combo_product = new dhtmlXCombo(input_parent,"combo_product",122);
		iface.combo_product.DOMelem.classList.add('pl_combo');
		iface.combo_product.allowFreeText(false);
		iface.combo_product.enableFilteringMode('between');
		iface.combo_product.attachEvent("onChange", function(){

			if(v.current_product = (this.getSelectedValue() || ""))
				process_message();

		});

		txt_label = document.createElement('div');

		txt_label.innerHTML = 'Задание';
		txt_label.className = "dhx_toolbar_text";
		input_parent.appendChild(txt_label);

		iface.combo_task = new dhtmlXCombo(input_parent,"combo_task",122);
		iface.combo_task.DOMelem.classList.add('pl_combo');
		iface.combo_task.load($p.wsql.get_user_param("pl_hs_url") + "/q/combo_task");
		iface.combo_task.enableFilteringMode('between', $p.wsql.get_user_param("pl_hs_url") + "/q/combo_task", false, false);
		//iface.combo_task.allowFreeText(false);
		iface.combo_task.enableAutocomplete();
		iface.combo_task.attachEvent("onChange", function(){

			if(v.current_task = (this.getSelectedValue() || "")){

				$p.ajax.get($p.wsql.get_user_param("pl_hs_url") + "/q/task_production?task="+v.current_task)
					.then(function(req){
						iface.combo_product.clearAll();
						iface.combo_product.load(req.responseText);
					})
					.then(process_message);
			}

		});
		//iface.combo_task.attachEvent("onDynXLS", function(text){
		//
		//	this.clearAll();
		//	$p.ajax.get($p.wsql.get_user_param("pl_hs_url") + "/q/combo_task?mask=" + text +
		//		"&order=" + (v.current_order || "") +
		//		"&product=" + (v.current_product || ""))
		//		.then(function(req){
		//			iface.combo_task.load(req.responseText);
		//		});
		//	return false;
		//
		//});


		// заполним подменю доступных вариантов
		for(var cmode in v.modes)
			this.addListOption("bs_mode", cmode, "~", "button", v.modes[cmode].presentation);

		// подключаем обработчик кликов
		this.attachEvent("onclick", toolbar_click);
		dhtmlxEvent(document.body, "keydown", wnd_keydown);
		dhtmlxEvent(iface.input_barcode, "keydown", $p.cancel_bubble);
		dhtmlxEvent(iface.input_barcode, "change", input_change);

		// оформляем поле режима
		iface.mode_text = this.objPull[this.idPrefix+"mode_text"];
		iface.mode_text.obj.classList.add('tb_title');

		process_message(true);

	});

};