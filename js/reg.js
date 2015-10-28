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
			store_name = "barcodes";

		function connect_idx_store(name){

			return new Promise(function(resolve, reject){
				var request = indexedDB.open(name, 1);
				request.onerror = function(err){
					reject(err);
				};
				request.onsuccess = function(){
					// При успешном открытии вызвали коллбэк передав ему объект БД
					resolve(request.result);
				};
				request.onupgradeneeded = function(e){
					// Если БД еще не существует, то создаем хранилище объектов.
					e.currentTarget.result.createObjectStore(name, { keyPath: "ref" });
					return connect_idx_store(name);
				}
			});
		}

		connect_idx_store(store_name)
			.then(function (idx_store) {

				function save_idxdb(o){
					var request = idx_store.transaction([store_name], "readwrite").objectStore(store_name).put(o._obj);
					request.onerror = function(err){
						console.log(err);
					};
					request.onsuccess = function(){
						return request.result;
					}
				}

				// попытка синхронизации всех незасинхронизированных
				function try_sync(){

				}


				function restore_idxdb(){

					var barcodes = [];

					idx_store.transaction([store_name], "readonly").objectStore(store_name).openCursor().onsuccess = function(event) {
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

				// такт синхронизации запускаем раз в минуту
				setInterval(try_sync, 60000);

				/**
				 * Обработчик события "перед записью"
				 * @this {DataObj} - обработчик вызывается в контексте текущего объекта
				 * @return {Boolean} - если ложь, стандартные операции не выполняются
				 */
				_mgr.attache_event("before_save", function (attr) {

					// запишем в indexeddb, чтобы восстановить после перезапуска браузера
					save_idxdb(this);

					return false;
				});

				_mgr.__define({
					clear_idxdb: {
						value: function (date) {

						}
					}
				});

				// читаем кеш
				restore_idxdb();

			})
			.catch(function (err) {
				console.log(err);
			});



	});


};

/**
 * Рисуем основное окно при инициализации документа
 */
$p.iface.oninit = function() {

	var hprm;       // параметры URL

	// менеджеры закладок
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
				$p.iface.scandrv.onscan.push(function (code) {
					if(code.length != 15 || code[0] != "G" || isNaN(parseInt(code.substr(1)))){
						$p.iface.beep.error();
						return;
					}

					$p.doc.barcodes.create()
						.then(function (o) {
							o.date = new Date();
							o.number_doc = code;
							o.save()
								.then(function () {
									$p.iface._scan.wnd.elmnts.grid.reload();
								})
								.catch(function (err) {
									console.log(err);
								});
						});

					$p.iface.beep.ok();
				});

				// список документов штрихкод
				$p.iface._scan.grid = $p.iface._scan.layout.cells("b");
				setTimeout(function () {
					$p.iface._scan.wnd = $p.doc.barcodes.form_selection($p.iface._scan.grid, {
						hide_header: true,
						date_from: new Date(),
						on_grid_inited: function () {

							$p.iface._scan.wnd.elmnts.toolbar.hideItem("btn_select");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("sep1");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("btn_new");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("btn_edit");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("btn_delete");
							$p.iface._scan.wnd.elmnts.toolbar.hideItem("sep2");

							$p.iface._scan.wnd.elmnts.filter.input_filter.blur();

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

			},

			settings: function(cell){

				if($p.iface._settings)
					return;

				$p.iface._settings = {
					dp: $p.dp.provider_orders.create()
				};
				$p.iface._settings.grid = cell.attachHeadFields({obj: $p.iface._settings.dp});
				var fields = $p.iface._settings.dp._metadata.fields;
				for(var fld in fields){
					$p.iface._settings.dp[fld] = $p.job_prm[fld] || $p.wsql.get_user_param(fld);
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
			hprm = $p.job_prm.parse_url();
			if(!hprm.view || $p.iface.main.getAllTabs().indexOf(hprm.view) == -1)
				$p.iface.set_hash(hprm.obj, hprm.ref, hprm.frm, "scan");
			else
				setTimeout($p.iface.hash_route);
		})
		.catch(function (err) {
			console.log(err);
		});


};


