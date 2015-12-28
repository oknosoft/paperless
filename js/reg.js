/**
 * Регистрация событий безбумажки
 * Created 26.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @license content of this file is covered by Oknosoft Commercial license. Usage without proper license is prohibited. To obtain it contact info@oknosoft.ru
 * @author    Evgeniy Malyarov
 * @module  reg
 */

/**
 * Процедура устанавливает параметры работы программы, специфичные для текущей сборки
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 * @param modifiers {Array} - сюда можно добавить обработчики, переопределяющие функциональность объектов данных
 */
$p.settings = function (prm, modifiers) {

	// для транспорта используем irest, а не сервис http
	prm.rest = false;
	prm.irest_enabled = true;

	// разделитель для localStorage
	prm.local_storage_prefix = "pl_reg_";

	// расположение rest-сервиса ut
	prm.rest_path = "/kademo/%1/odata/standard.odata/";

	// адрес команды регистрации
	prm.reg_path = "/kademo/hs/rest/Module_пзБезбумажкаСервер/ЗарегистрироватьМассивШтрихкодов/";

	// по умолчанию, обращаемся к зоне %%%
	prm.zone = 0;

	// расположение файлов данных
	prm.data_url = "data/";

	// расположение файла инициализации базы sql
	prm.create_tables = "data/create_tables.sql";

	// полноэкранный режим на мобильных устройствах
	prm.request_full_screen = true;

	// разрешаем сообщения от других окон
	prm.allow_post_message = "*";

	// используем геокодер
	prm.use_google_geo = false;

	// логин гостевого пользователя
	prm.guest_name = "Admin";

	// пароль гостевого пользователя
	prm.guest_pwd = "";

	// разрешаем покидать страницу без лишних вопросов
	$p.eve.redirect = true;

	// подключаем модификатор, в котором реализуем отложенную запись штрихкодов
	modifiers.push(function($p){

		var _mgr = $p.doc.barcodes, // менеджер документа штрихкодов
			db_name = "paperless",
			store_name = "barcodes";

		$p.wsql.idx_connect(db_name, store_name)
			.then(function (idx_db) {

				// попытка синхронизации всех незасинхронизированных
				function try_sync(arr){
					// если массив не задан, ищем все незасинхронизированные
					if(!arr)
						arr = _mgr.find_rows({lc_changed: 0});
					if(!arr.length)
						return;
					var prm = JSON.stringify(arr.map(function(o) {
							return o._obj;
						})),
						rattr = {};
					$p.ajax.default_attr(rattr, $p.wsql.get_user_param("reg_path") || $p.job_prm.reg_path);
					rattr.url += "?arr=" + prm + "&department=" + $p.wsql.get_user_param("department");
					$p.ajax.get_ex(rattr.url, rattr)
						.then(function (req) {
							prm = JSON.parse(req.response);
							prm.forEach(function (o) {
								// если есть ошибка
								if(o.error){
									// и если ошибка для данного штрихкода еще не зарегистрирована
									if(!$p.ireg.$log.find_rows({note: {like: o.number_doc}}).length)
										$p.record_log({
											note: o.number_doc + ": " + o.error,
											class: "error"
										});
								}else{
									var obj = _mgr.get(o.ref);
									obj.lc_changed = o.lc_changed;
									obj.save();
								}
							});
						})
						.then(function () {
							$p.iface._scan.wnd.elmnts.grid.reload();
						})
						.catch($p.record_log);
				}


				function restore_idxdb(){

					var barcodes = [];

					idx_db.transaction([store_name], "readonly").objectStore(store_name).openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							barcodes.push(cursor.value);
							cursor.continue();
						}
						else {
							if(barcodes.length)
								_mgr.load_array(barcodes);

						}
					};
				}

				/**
				 * Обработчик события "перед записью"
				 * @this {DataObj} - обработчик вызывается в контексте текущего объекта
				 * @return {Boolean} - если ложь, стандартные операции не выполняются
				 */
				_mgr.attache_event("before_save", function (attr) {

					var obj = this;

					// запишем в indexeddb, чтобы восстановить после перезапуска браузера
					$p.wsql.idx_save(obj, idx_db, store_name)
						.then(function () {
							if(!obj.lc_changed)
								try_sync([obj])
						});

					return false;
				});

				_mgr.__define({

					idxdb_clear: {
						value: function (date) {

							var prm = $p.dp.drop_prm.create();
							prm.date = new Date();
							prm.state = $p.enm.СостоянияОтправки.Отправленные;

							function _delete(){

								var keys = [];

								idx_db.transaction([store_name], "readonly").objectStore(store_name).openCursor().onsuccess = function(event) {
									var cursor = event.target.result;
									if (cursor) {
										// здесь фильтруем
										if(cursor.value.date <= prm.date){
											if((prm.state == $p.enm.СостоянияОтправки.Все) ||
												(prm.state == $p.enm.СостоянияОтправки.Отправленные && cursor.value.lc_changed != 0) ||
												(prm.state == $p.enm.СостоянияОтправки.НеОтправленные && cursor.value.lc_changed == 0))
												keys.push(cursor.value.ref);
										}
										cursor.continue();
									}
									else {
										if(keys.length){
											// а здесь удаляем отфильтрованные
											$p.eve.reduce_promices(
												keys.map(function(key) {
													_mgr.delete_loc(key);
													return $p.wsql.idx_delete(key, idx_db, store_name);
												}), function () {

												})
												.then(function (v) {
													$p.iface._scan.wnd.elmnts.grid.reload();
												})
										}
									}
								};
							}

							if(date){
								prm.date = date;
								_delete();
							}else{
								var options = {
										name: 'text',
										wnd: {
											caption: "Параметры удаления",
											width: 290,
											height: 130,
											allow_close: true,
											modal: true
										}
									},
									wnd = $p.iface.dat_blank(null, options.wnd),
									grid = wnd.attachHeadFields({obj: prm});
								wnd.center();
								wnd.bottom_toolbar({
									buttons: [
										{name: 'btn_ok', b: 'Удалить устаревшие', width:'170px', float: 'right'}],
									onclick: function (name) {
										wnd.close(true);
										_delete();
										return false;
									}
								});
							}
						}
					},

					idxdb_sync: {
						value: function (arr) {
							try_sync(arr);
						}
					},

					register_code: {
						value: function (code){

							var err = false;

							//http://paperless.oknosoft.local/#s=G00122086061701
							//if(code.length != 15 || code[0] != "G" || isNaN(parseInt(code.substr(1)))){
							// защита от ложных срабатываний
							if(code.length < 13 || isNaN(parseInt(code))){
								err = true;
								if(code.length > 2)
									$p.iface.beep.error();
								else
									return;
							}

							_mgr.create()
								.then(function (o) {
									o.date = new Date();
									o.number_doc = code;
									o.ОшибкаШтрихкода = err;
									o._set_loaded(o.ref);
									o.save()
										.then(function () {
											if($p.iface._scan)
												$p.iface._scan.wnd.elmnts.grid.reload();
										})
										.catch($p.record_log);
								});

							if(!err)
								$p.iface.beep.ok();
						}
					}


				});

				// если штрихкод передали в url - регистрируем
				if($p.job_prm._s){
					_mgr.register_code($p.job_prm._s);
					delete $p.job_prm._s;
				}

				// читаем кеш
				restore_idxdb();

				// такт синхронизации запускаем раз в три минуты
				setInterval(try_sync, 200000);

			})
			.catch($p.record_log);

	});

};

/**
 * Рисуем основное окно при инициализации документа
 */
$p.iface.oninit = function() {

	var hprm;       // параметры URL

	// менеджеры закладок - их можно растащить по разным файлам
	$p.iface.tabmgrs = {

		scan: function(cell){

				if($p.iface._scan)
					return;

				$p.iface._scan = {
					layout: cell.attachLayout({
						pattern: "2E",
						cells: [
							{id: "a", text: "search", height: 34, header: false, fix_size: [false, true]},
							{id: "b", text: "grid", header: false}
						],
						offsets: {
							top: 0,
							right: 0,
							bottom: 0,
							left: 0
						}
					})
				};
				$p.iface._scan.input = $p.iface._scan.layout.cells("a");
				$p.iface._scan.input.setMinHeight(34);
				$p.iface._scan.input.setHeight(34);
				$p.iface._scan.input.cell.lastChild.style.paddingTop = "4px";
				$p.iface._scan.input.cell.lastChild.style.paddingBottom = "12px";

				// драйвер штрихкода
				$p.iface.scandrv = new $p.iface.ScanDriver($p.iface._scan.input);

				// обработчик события штрихкода
				$p.iface.scandrv.onscan.push(function(code) {
					$p.doc.barcodes.register_code(code);
				});

				// список документов штрихкод
				$p.iface._scan.grid = $p.iface._scan.layout.cells("b");
				setTimeout(function () {
					$p.iface._scan.wnd = $p.doc.barcodes.form_list($p.iface._scan.grid, {
						hide_header: true,
						date_from: new Date(),
						on_grid_inited: function () {

							$p.iface._scan.wnd.elmnts.filter.input_filter.blur();

							$p.iface._scan.wnd.elmnts.toolbar.hideItem("btn_select");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("sep1");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("btn_new");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("btn_edit");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("btn_delete");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("sep2");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("lbl_filter");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("input_filter");
							$p.iface._scan.wnd.elmnts.toolbar.setItemText("lbl_date_from", "с:");

							$p.iface._scan.wnd.elmnts.toolbar.removeListOption("bs_more", "btn_import");
							$p.iface._scan.wnd.elmnts.toolbar.removeListOption("bs_more", "btn_export");

							$p.iface._scan.wnd.elmnts.toolbar.addListOption("bs_more", "sync", "~", "button", "<i class='fa fa-cloud-upload fa-lg'></i> Выгрузить 1С");
							$p.iface._scan.wnd.elmnts.toolbar.addListOption("bs_more", "full_screen", "~", "button", "<i class='fa fa-expand fa-lg'></i> Полный экран");
							$p.iface._scan.wnd.elmnts.toolbar.addListOption("bs_more", "clear", "~", "button", "<i class='fa fa-times fa-lg'></i> Удалить устаревшие данные");
							$p.iface._scan.wnd.elmnts.toolbar.attachEvent("onclick", function(btn_id){
								if(btn_id=="full_screen"){
									if(document.documentElement.webkitRequestFullScreen)
										document.documentElement.webkitRequestFullScreen();
									else if(document.documentElement.mozRequestFullScreen)
										document.documentElement.mozRequestFullScreen();

								}else if(btn_id=="sync")
									$p.doc.barcodes.idxdb_sync();

								else if(btn_id=="clear")
									$p.doc.barcodes.idxdb_clear();

							});

							// запрещыем редактирование флажком
							$p.iface._scan.wnd.elmnts.grid.attachEvent("onCheck", function(rid,cind,state){
								$p.iface._scan.wnd.elmnts.grid.cells(rid,2).setValue(!state);
							});
						}
					});

				}, 40);
			},

		orders: function(cell){

			if($p.iface._orders)
				return;

			$p.iface._orders = {
				dp: $p.dp.provider_orders.create()
			};
			$p.iface._orders.grid = cell.attachTabular({obj: $p.iface._orders.dp, ts: "orders"});


		},

		report: function(cell){
			if($p.iface._report)
				return;
		},

		about: function(cell){
			if($p.iface._about)
				return;

			$p.iface._about = {};
			$p.ajax.get("data/about_reg.html")
				.then(function (req) {
					cell.attachHTMLString(req.response);
					cell.cell.querySelector(".dhx_cell_cont_tabbar").style.overflow = "auto";
				});
		},

		settings: function(cell){

			if($p.iface._settings)
				return;

			// сверху - параметры, снизу - журнал регистрации
			$p.iface._settings = {
				dp: $p.dp.provider_orders.create()
			};
			$p.iface._settings.grid = cell.attachHeadFields({obj: $p.iface._settings.dp});
			var fields = $p.iface._settings.dp._metadata.fields;
			for(var fld in fields){
					$p.iface._settings.dp[fld] = $p.job_prm[fld] || $p.wsql.get_user_param(fld);
				}
			Object.observe($p.iface._settings.dp, function (changes) {
					changes.forEach(function(change){
						var v = $p.iface._settings.dp[change.name];
						if($p.is_data_obj(v))
							v = v.ref;
						$p.wsql.set_user_param(change.name, v);
					});
				}, ["update"]);

		},

		log: function (cell) {

			if($p.iface._log)
				return;

			$p.iface._log = {
				wnd: $p.ireg.$log.form_list(cell, {hide_header: true})
			};

			$p.iface._log.wnd.elmnts.toolbar.removeListOption("bs_more", "btn_import");
			$p.iface._log.wnd.elmnts.toolbar.removeListOption("bs_more", "btn_export");

			if($p.device_type != "desktop"){
				$p.iface._log.wnd.elmnts.toolbar.hideItem("btn_select");
				$p.iface._log.wnd.elmnts.toolbar.hideItem("sep1");
				$p.iface._log.wnd.elmnts.toolbar.hideItem("btn_new");
				$p.iface._log.wnd.elmnts.toolbar.hideItem("btn_edit");
				$p.iface._log.wnd.elmnts.toolbar.hideItem("btn_delete");
				$p.iface._log.wnd.elmnts.toolbar.hideItem("sep2");
				$p.iface._log.wnd.elmnts.toolbar.hideItem("lbl_filter");
				$p.iface._log.wnd.elmnts.toolbar.hideItem("input_filter");
			}

		},

		worker: function () {
			var worker = new Worker('js/worker.js');
			worker.addEventListener('message', function(e) {
				if(e.data.action == "lazy_load"){
					var mgr = $p.md.mgr_by_class_name(e.data.class_name),
						data = [];
					e.data.res.value.forEach(function (rdata) {
						data.push($p.rest.to_data(rdata, mgr));
					});
					mgr.load_array(data, true);

				}else
					console.log('Worker said: ', e.data);
			}, false);

			var attr = {
				action: "lazy_load",
				username: $p.wsql.get_user_param("user_name"),
				password: $p.wsql.get_user_param("user_pwd"),
				class_name: "cat.Подразделения"
			};
			if(attr.username){
				$p.rest.build_select(attr, $p.cat.Подразделения);
				worker.postMessage(attr);
			}
		}
	};

	// midi пикалка - инфонмирует об успешном и ошибочном сканировании
	$p.iface.beep = {
		ok: function () {
			new Beep.Voice( '4D' )
				.setOscillatorType( 'square' ) //  For that chunky 8-bit sound.
				.setAttackGain( 0.8 )           //  0 = No gain. 1 = Full gain.
				.setAttackDuration( 0.1 )      //  Attack ramp up duration in seconds.
				.setDecayDuration( 0.1 )       //  Decay ramp down duration in seconds.
				.setSustainGain( 0.5 )          //  Sustain gain level; percent of attackGain.
				.setSustainDuration( 0.1 )     //  Sustain duration in seconds -- normally Infinity.
				.setReleaseDuration( 0.1 )     //  Release ramp down duration in seconds.
				.play( 1.5 );
		},
		error: function () {
			var voice = new Beep.Voice( '1C');
			function play(){
				voice.setOscillatorType( 'square' ) //  For that chunky 8-bit sound.
					.setAttackGain( 0.8 )           //  0 = No gain. 1 = Full gain.
					.setAttackDuration( 0.05 )      //  Attack ramp up duration in seconds.
					.setDecayDuration( 0.05 )       //  Decay ramp down duration in seconds.
					.setSustainGain( 0.5 )          //  Sustain gain level; percent of attackGain.
					.setSustainDuration( 0.1 )     //  Sustain duration in seconds -- normally Infinity.
					.setReleaseDuration( 0.05 )     //  Release ramp down duration in seconds.
					.play( 4 );
			}
			for(var count = 0; count < 3; count++)
				setTimeout(play, count * 300);

		}
	};

	// основа интерфейса - панель закладок
	$p.iface.main = new dhtmlXTabBar({
		parent:             document.body,
		arrows_mode:        "auto",
		offsets: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},
		tabs: [
			{
				id:      "scan",
				text:    "Скан"
			},
			{
				id:      "orders",
				text:    "Заказы"
			},
			{
				id:      "report",
				text:    "Отчет"
			},
			{
				id:      "settings",
				text:    "Настройки"
			},
			{
				id:      "log",
				text:    "Журнал"
			},
			{
				id:      "about",
				text:    "О программе"
			}

		]
	});
	$p.iface.docs = $p.iface.main.cells("report");

	$p.iface.main.attachEvent("onSelect", function(id){

		hprm = $p.job_prm.parse_url();
		if(hprm.view != id)
			$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, id);

		setTimeout(function () {
			$p.iface.tabmgrs[id]($p.iface.main.cells(id))
		});

		return true;

	});

	// маршрутизация URL
	$p.eve.hash_route.push(function (hprm) {

		// view отвечает за переключение закладки в TabBar
		if(hprm.view && $p.iface.main.getActiveTab() != hprm.view){
			$p.iface.main.getAllTabs().forEach(function(item){
				if(item == hprm.view)
					$p.iface.main.tabs(item).setActive();
			});
		}

		return false;
	});

	$p.eve.auto_log_in()
		.then(function () {

			$p.iface.tabmgrs.worker();

			hprm = $p.job_prm.parse_url();
			if(hprm.hasOwnProperty("s"))
				$p.job_prm._s = hprm.s;

			if(!hprm.view)
				hprm.view = "scan";
			if(["scan", "orders", "settings", "log", "about"].indexOf(hprm.view) != -1)
				$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, hprm.view);

			else
				setTimeout($p.iface.hash_route, 40);

		})
		.catch($p.record_log);

};

