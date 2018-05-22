/**
 *
 * Created 27.10.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @license content of this file is covered by Oknosoft Commercial license. Usage without proper license is prohibited. To obtain it contact info@oknosoft.ru
 * @author    Evgeniy Malyarov
 * @module  scan_driver
 */

/**
 * Драйвер клавиатурного штрихкода. Может иметь поле ввода, а может работать "в слепую" просто обрабатывая события
 * @param [contaner] {HTMLElement|dhtmlXCellObject} - если указано, в этом контейнере будет создано поле ввода штрихкода
 * @constructor
 */
$p.iface.ScanDriver = function ScanDriver(contaner){

	var t = this,
		timeStamp = 0,
		kb = [],    // клавиатурный буфер
		s = "",     // текущее значение штрихкода
		input;      // поле ввода штрихкода


	t.__define({

		/**
		 * Обработчики событий сканирования
		 * @property onscan
		 * @type Modifiers
		 * @static
		 */
		onscan: {
			value: new $p.Modifiers(),
			enumerable: false,
			configurable: false
		}
	});

	if(contaner){

		input = document.createElement('input');

		if(contaner instanceof dhtmlXCellObject){
			contaner.attachObject(input);
		}else if(contaner instanceof HTMLElement){
			contaner.appendChild(input);
		}else
			return;

		input.className = "scan";
		input.type = "search";
		input.addEventListener('keydown', $p.cancel_bubble);
		input.addEventListener('change', function(evt){
			s = input.value;
			if(s){
				setTimeout(function(){
					t.onscan.execute(s);
					setTimeout(function(){
						input.value = "";
					}, 100);
				});
			}
			return $p.cancel_bubble(evt);
		});
	}

	/**
	 *	Обработчик нажатия клавиши везде, кроме поля ввода штрихкодов
	 */
	document.body.addEventListener('keydown', function(evt){

		function clear_buffer(){
			s = "";
			kb.length = 0;
		}

		if(evt.keyCode == 13) {

			if(kb.length){
				s = "";
				kb.forEach(function(code){
					if(code > 30)
						s = s + String.fromCharCode(code);
				});
				if(input)
					input.value = s;
				setTimeout(t.onscan.execute(s));
			}
		}else if(evt.keyCode == 27 || evt.keyCode == 8 || evt.keyCode == 46){
			clear_buffer();
		}else{
			// сравним время с предыдущим. если маленькое, добавляем в буфер. если большое - пишем последний элемент
			if(evt.timeStamp - timeStamp > 100)
				clear_buffer();
			timeStamp = evt.timeStamp;
			kb.push(evt.keyCode);
		}

		return false;

	}, false);

}
