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

	// для транспорта используем rest, а не сервис http
	prm.rest = true;
	prm.irest_enabled = true;

	// расположение rest-сервиса ut
	prm.rest_path = "/kademo/%1/odata/standard.odata/";

	// по умолчанию, обращаемся к зоне %%%
	prm.zone = 0;

	// расположение файлов данных
	prm.data_url = "data/";

	// расположение файла инициализации базы sql
	//prm.create_tables = "data/create_tables.sql";

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

};

/**
 * Рисуем основное окно при инициализации документа
 */
$p.iface.oninit = function() {

	var myTabbar = new dhtmlXTabBar({

		parent:             document.body,    // id/object, container for tabbar

		arrows_mode:        "auto",         // mode of showing tabs arrows (auto, always)

		offsets: {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},

		tabs: [
			{
				id:      "scan",
				text:    "Скан",
				active:  true
			},
			{
				id:      "orders",
				text:    "Заказы",
				active:  true
			},
			{
				id:      "report",
				text:    "Отчет",
				active:  true
			},
			{
				id:      "settings",
				text:    "Настройки",
				active:  true
			}
		]

	});
};

$p.eve.hash_route.push(function (hprm) {

	return false;
});

