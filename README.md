# paperless.js - manufacturing execution system (Подсистема безбумажного управления производством)

Набор компонентов javascript, внешних обработок для 1С и методических рекомендаций для организации безбумажного производства в цехах сборки окон из ПВХ, деревянного и алюминиевого профиля.

Комплекс позволяет выводить на экран по результатам сканирования этикеток либо с интерактивными фильтрами:
- состав заданий на производство
- расстановку заготовок по ячейкам
- чертежи и фрагменты спецификаций изделий

При необходимости, система может:
- формировать в реальном времени команды для отрезных, отрубных, фрезерных и сварочных станков
- регистрировать события поступления, готовности или отгрузки изделий и полуфабрикатов на любых производственных переделах

## Лицензия
Доступ к материалам данного репозитоиря (далее по тексту ПО - программное обеспечение), предоставляется **исключительно в личных информационно-ознакомительных целях**. При возникновении необходимости иного использования полученных материалов, Вы обязаны обратиться к Правообладателю (info@oknosoft.ru) для заключения [договора на передачу имущественных прав](http://www.oknosoft.ru/programmi-oknosoft/metadata.html).

- Распространение ПО как самостоятельного продукта запрещено
- Распространение ПО в составе продуктов, являющихся конкурентами metadata.js, или обладающих схожей с функциональностью - запрещено
- Коммерческая [лицензия на разработчика](http://www.oknosoft.ru/programmi-oknosoft/metadata.html) позволяет использовать и распространять ПО в любом количестве неконкурирующих продуктов, без ограничений на количество копий

Данная лицензия распространяется на все содержимое репозитория, но не заменяют существующие лицензии для продуктов, используемых библиотекой metadata.js
 
## Демо безбумажки
Для разворачивания демо-примера, потребуется:
- Установленная платформа 1С
- Актуальная версия  [УПзП](http://www.oknosoft.ru/program-possibilities.html)
- web-сервер Apache2.2
- Файлы данного репозитория
- Если для неких рабочих мест нужно формирование эскизов фрагментов изделий (отдельно створка или стеклопакет), дополнительно потребуется развернуть службу [PhantomJS динамического формирования эскизов](http://www.oknosoft.ru/wiki/JS:%D0%A3%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0_%D0%B8_%D0%BD%D0%B0%D1%81%D1%82%D1%80%D0%BE%D0%B9%D0%BA%D0%B0_PhantomJS_%D0%B2_Linux_%D0%B8_Windows)

### Публикация http-сервиса paperless
- Если в локальной сети развёрнут сервер DNS, создадим для компьютера с Apache запись A или CNAME с именем, например `paperless.local`. Если локальной службы DNS нет, добавим строчку в файлы `hosts` на всех компьютерах, которые будут использованы для безбумажки
- Добавляем в конфигурационные файлы Apache настройки публикации сервиса 1С (см. примеры для [windows](1c/httpd.1c.windows.conf) и [linux](1c/httpd.1c.linux.conf)
- Размещаем по опубликованному пути файл [default.vrd](1c/default.vrd) и редактируем в нём строку подключения с тем, чтобы она указывала на правильные сервер 1С и базу УПзП на этом сервере
- Параметр `enable="false"` после параметра `ib="..."` в файле `default.vrd` отключает публикацию тонкого и веб-клиентов 1С. Если этот параметр сброшен, подключиться к 1С обычными клиентами не получится. Наружу будет смотреть только http-сервис
- Параметры `Usr=...;Pwd=...;` в строке `ib="..."` отключают запрос ввода имени и пароля пользователя при обращении к веб-сервису. Если эти параметры не указывать в строке подключения, потребуется авторизация в браузере
 
Для проверки правильности выполнения этого шага, набираем в строке браузера http://paperless.local/kademo/hs/pl - должна получиться примерно такая картинка:
![Пустой ответ сервиса](https://raw.githubusercontent.com/oknosoft/paperless/master/data/blank-response.png)

### Настройка на стороне 1С
- Читаем тест модуля http-сервиса `PaperLess` внутри УПзП
- Читаем тексты модулей обработок из папки [1c](1c) текущего репозитория. Начать рекомендуется с обработки `БезбумажкаСкелетон.epf` - отсальные обработки от неё унаследованы
- Подключаем интересующие обработки в стандартном БСП-шном справочнике `ДополнительныеОтчетыИОбработки`
- Для целей отладки, в модуле http-сервиса `PaperLess` строка 202, можно заменить код:
```
// ОтчетОбъект = ДополнительныеОтчетыИОбработки.ПолучитьОбъектВнешнейОбработки(Рез.Ссылка);
на
ОтчетОбъект = ВнешниеОбработки.Создать("путь_к_обработке.epf", Ложь);
```
- Размещаем в константе `БЕЗБУМАЖКА_ВАРИАНТЫ_ОТЧЕТОВ` в разделе `ФОРМИРОВАНИЕ ДОКУМЕНТОВ и ОТЧЕТОВ` текст описания используеых обработок безбумажки. Пояснения к содержанию константы доступны в форме 1С. Продублируем их здесь:
```
// каждая строка - описание варианта
// точка с запятой - разделитель полей варианта
// Представление для меню; Имя обработки, Имя метода, Имя варианта - 4 поля					
Обзор задания;paperless_view_task;;Профиль
Фурнитура;paperless_furn;;Профиль
Остекление;paperless_glass;;Профиль
СГП;paperless_stock;;Профиль
План ПВХ;paperless_plan_pvc;Проводник;
```
Данный пример сообщит javascript-движку безбумажки, что для для выполнения команд на стороне 1С, доступны 5 обработок (paperless_view_task, paperless_furn, paperless_glass, paperless_stock и paperless_plan_pvc). Система построит меню выбора варианта из пяти пунктов (Обзор задания, Фурнитура, Остекление, СГП и План ПВХ)

### Настройка на стороне клиента
Откроем браузер на странице http://paperless.local/options.html - должна получиться примерно такая картинка:
![options.html](https://raw.githubusercontent.com/oknosoft/paperless/master/data/options.png)
- В поле `URL http-сервиса 1С`, уточняем адрес публикации службы 1С
- Поле `URL сервиса PhantomJS` имеет смысл заполнять в случае, если планируется обращаться к фантому с клиента для формирования эскизов
- Поля `URL node-сервиса relay`, `Адрес фурн. станции` и `Порт фурн. станции` имеет смысл заполнять для рабочих мест, которые должны отправлять команды отрубающему механизму фурнитурной станции
- Поле `Варианты` недоступно для редактирования и заполняется текстом константы 1С `БЕЗБУМАЖКА_ВАРИАНТЫ_ОТЧЕТОВ` по кнопке `Прочитать из 1С`
- В поле `Действие по умолчанию` можно указать строку варианта, который будет использован по умолчанию на данном рабочем месте

### Сканер
Страница безбумажки направляет весь клавиатурный ввод в буфер `v.kb` (см. функцию `wnd_keydown` модуля [wnd_main](js/wnd_main.js#L169). Для получения данных клавиатурного сканера нет необходимости переводить фокус ввода в поле `Штрихкод` - текст штрихкода заполняется автоматически.

Для работы со сканером, эмулирующим COM-порт, следует установить программу-транслятор из com в клавиатуру. Например, [Datasnip](http://www.priority1design.com.au/datasnip.html)

Сканеры, подключенные к мобильным устройствам через micro-usb или bluetooth, обычно отображаются как клавиатурное устройство ввода и не требуют дополнительной настройки.
 
Для распознавания штрихкода, возможно использование камеры мобильного устройства. Для этого необходимо в настройках программы сканирования настроить url перехода, как http://paperless.local/?s=%%%, где %%% - штрихкод, который распознала программа

### Регистрация событий в 1С
Пример регистрации в таблице 1С некого события, приведён в процедурах `Регистрация()` и `РегистрацияДаты()` обработки `БезбумажкаФурнитура.epf`.
Переход к этим процедурам происходит в случае, если в структуре параметров запроса, передаваемого страницей безбумажки в 1С, параметр `Режим.Вариант` принимает значения `Регистрация` или `calendar_delivery`.

Для привязки регистрируемого события к конкретному подразделению, рабочему месту и исполнителю, служит форма `registration_prm`, описанная в модуле [wnd_registration_prm](js/wnd_registration_prm.js)

### Структура url и параметры запроса к 1С
При открытии страницы безбумажки, так же, как при событиях выбора значений в полях ввода или событиях сканера, в 1С передаётся единообразная струетура параметров. Дублируем здесь описание состава и типов полей структуры, приведенного в модуле http-сервиса PaperLess УПзП:
- Штрихкод - Строка - параметр url: "s" - по умолчанию пустая строка
- ИдКлиента - Строка - параметр url: "browser_uid"	- GUID, к которому можно привязать сохраненные настройки
- Режим - Структура - параметр url: "m" - Например, идентификатор отчета или указание, что регистрировать. Если в запросе на этом месте json-строка, она десериализуется в структуру. Таким образом, в параметер m можно передать довольно сложные и длинные данные
- Формат - Строка - параметр url: "f", формат, в котором возвращать данные. Доступные значения {json, xml, html, pdf, blob, base64}

## Иллюстрации
### Режим *Обзор задания*
![Обзор задания](https://raw.githubusercontent.com/oknosoft/paperless/master/data/paperless_view_task.png)
Используется начальником производства, содержит информацию о составе изделий, включенных в задание с эскизами, фрагментами спецификаций и комментариями менеджеров и замерщиков. Начальник производства анализирует наличие нестандартных позиций и принципиальную выполнимость задания, ставит визу *В производство* или *Отклонить - доработать*

### Режим *Фурнитура*
![Фурнитура](https://raw.githubusercontent.com/oknosoft/paperless/master/data/paperless_furn.png)
Используется на одноименном участке. Пример интересен множеством задействованных инструментов, среди которых
- Пользовательские поля `Дата` и `Примечание`, содержимое которых отправляется вместе со стандартными полями в 1С при регистрации
- Пример вызова методов регистрации событий в 1С
- Форма `Параметры регистрации`, в которой уточняется `Подразделение` и `Исполнитель`
- Условное оформление спецификации. Можно задать жирность и цвет шрифта и фона как отдельных полей, так и строк таблицы
- Гиперссылки в спецификации и назначение обработчиков нажатия гиперссылок на стороне клиента и стороне 1С
- Возможность переопределить произвольные параметры URL, задать быстрые управляющие клавиши или спциальные управляющие штрихкоды в модуле [scancmd](js/scancmd.js)
- Пример взаимодействия с оборудованием на низком уровне. Функция `do_furn_cut()` модуля [scancmd](js/scancmd.js#L178) отправляет строку с адресом, номером порта и координатами в релейную службу, реализованную на Node.js (файл [relay_http](js/relay_http.js)), которая перенаправляет сырые данные по winsocket в управляющий компьютер фурнитурной станции