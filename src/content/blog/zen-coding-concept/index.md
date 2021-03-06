---
title: 'Zen Coding 2.0. Концепт'
date: 2009-04-02
tags: post
layout: post.njk
---

На текущем этапе развития пакеты расширений [Zen Coding](/blog/zen-coding/) для редактора [TextMate](http://macromates.com/) зашли в тупик.

Можно конечно развить поддержку HTML 5, предусмотреть все свойства из CSS 3, реализовать ещё большее количество ежедневно необходимых шаблонов. И это будет сделано, но во вторую очередь. В первую очередь, я планирую серьёзно изменить способ набора HTML-кода и методику хранения библиотеки шаблонов в пакетах. Ну, и конечно улучшить логичность и интуитивность всех сокращений и сочетаний клавиш. Но обо всём попорядку.

Главная проблема текущей реализации Zen Coding состоит в ограничениях, которые накладывает внутренний механизм работы бандлов в TextMate:

- Все шаблоны нужно хранить в отдельных сущностях, что приводит к чрезвычайно трудоёмкому процессу изменения каких-то концептуальных механизмов. Самый яркий пример — переменная `TM_CSS_SPACE`, для её внедрения пришлось вручную перелопатить порядка 250 шаблонов.
- Работа с выборкой из выделения или текущей строки нужных переменных далека от совершенства и просто не позволяет получить каки-то элементы без дополнительных скриптов.

Самым логичным выходом из данной ситуации, на мой взгляд, является написание какой-то отдельной обёртки, которая будет содержать в себе библиотеку всех элементов, вызываться по клавише Tab, анализировать контекст применения и уже делать всё, что нужно, невзирая на ограничения встроенных в TextMate механизмов.

Что же планируется сделать:

## Zen HTML

Очевидно, что самым удобным синтаксисом для работы HTML-деревом является CSS-синтаксис. Самым ярким примером его использования является механизм [CSS Query](http://en.wikipedia.org/wiki/CssQuery) широко распространённый в современных JS-фреймворках. В них на всю катушку использются не только все селекторы выборки из CSS 3, но и другие кастомные штуки вроде `:even`, `:not`, `:enabled` и другие. И хорошо было бы использовать этот механизм выборки не только в CSS и JS, но и при написании HTML-кода.

Проанализировав типичные ситуации, возникающие при написании HTML, я пришёл к следующей группе базовых селекторов и их псевдонимов:

- ID: `E#name`
- Класс: `E.name`
- Вложенность: `E>E`
- Братство: `E+E`
- Повторение: `E*N`, простой псевдоним братского `E*3 = E+E+E`
- Разворачивание: `E+`, сложный псевдоним группы селекторов `E+ = E>E+…`

Базовые селекторы атрибутов `id` и `class`:

    div#name → <div id="name"></div>
    div.name → <div class="name"></div>
    div.one.two → <div class="one two"></div>
    div#name.name → <div id="name" class="name"></div>

Базовые селекторы `E>E` и `E+E` и их сочетания:

    bq>p →
    <blockquote>
       <p></p>
    </blockquote>
    p+p →
    <p></p>
    <p></p>
    ul>li+li →
    <ul>
       <li></li>
       <li></li>
    </ul>

Псевдонимы базовых — `E*N` и `E+`:

    p*2 →
    <p></p>
    <p></p>
    ul>li*2 →
    <ul>
       <li></li>
       <li></li>
    </ul>
    dl+ →
    <dl>
       <dt></dt>
       <dd></dd>
    </dl>

По сути, селектор `E+` не является точным указанием на структуру желаемого дерева, скорее это псевдоним к шаблону, то есть псевдоним `dl+` равносилен `dl>dt+dd`, а `table+` равносилен `table>tr>td`. Помимо этого, стоит понимать разницу между базовым селектором `E+E` и псевдонимом `E+` — в первом случае это обозначение следования друг за другом, а во втором это признак разворачиваемого шаблона.

Кажется, что подобным способом можно развернуть всё дерево документа, но это не так. Подобный синтаксис не предусматривает ветвление — углублять дерево можно только в одном направлении, т.е. вложить в одного родителя двух и более детей можно, но развить вложенность можно только для последнего из них. По идее, можно было бы придумать какую-то группировку, но это, во-первых, будет сильно противоречить CSS-синтаксису, а во-вторых, не настолько востребованно.

Чуть более сложный пример:

    div#page>h3.title+ul>li.item*3>a →
    <div id="page">
       <h3 class="title"></h3>
       <ul class="menu">
          <li class="item"><a href="#"></a></li>
          <li class="item"><a href="#"></a></li>
          <li class="item"><a href="#"></a></li>
       </ul>
    </div>

Вряд ли подобные конструкции будут использоваться слишком часто, но сам принцип формирования отдельных элементов при помощи CSS-синтаксиса видится мне наиболее удачным решением.

## Zen CSS

Этот пакет ожидают менее серьёзные изменения. Основные усилия будут направлены на следующее:

- Более логичную и удобную систему псевдонимов и предустановленных шаблонов.
- Поддержку всех актуальных CSS-свойств, присутствующих в черновике CSS 3 и уже реализованных в браузерах, в частности, с вендорными префиксами.
- Организация автоматической сортировки свойств в специфическом порядке.

Список актуальных свойств был составлен при помощи фильтрации [полного списка существующих](http://meiert.com/en/indices/css-properties/) в CSS 3 свойств. В итоге из 255 наименований осталось только 131 свойство, для каждого из которых был придуман короткий псевдоним `mt → margin-top`, а также набор шаблонов `f+ → font: 1em Arial,sans-serif`.

Помимо этого, актуальные свойства были разделены на группы и отсортированы в два этапа: порядок следования групп и порядок следования свойств в группе. Всего получилось восемь групп:

1. Позиционирование
2. Поведение и свойства блока
3. Размерность блока
4. Цветовое оформление
5. Специальные типы содержимого
6. Текст
7. Визуальные свойства
8. Печать

Логика группировки основывается на двух главных принципах:

- Движение снаружи внутрь: от позиционирования к свойствам блока и через текст к слову и шрифту.
- Движение от глобальных свойств к более частным и менее употребимым: от позиционирования к прозрачности, свойствам курсора и стилям для печати.

Внутри блоков логика «от глобального к частному» сохраняется, но начинает работать ещё один механизм, сортирующий подобные свойства в таком порядке, в котором их принято упоминать в сокращённой записи:

    font: bold italic small-caps 1em sans-serif;
    font-weight: bold;
    font-style: italic;
    font-variant: small-caps;
    font-size: 1em;
    font-family: sans-serif;

Тоже самое и со свойствами, относящимися к четырём сторонам объекта: за основу взят принцип **TR**ou**BL**e или **T**op **R**ight **B**ottom **L**eft, который используется в сокращённой записи:

    #box {
       position: absolute;
       top: 1px;
       right: 2px;
       bottom: 3px;
       left: 4px;
       padding: 1px 2px 3px 4px;
       padding-top: 1px;
       padding-right: 2px;
       padding-bottom: 3px;
       padding-left: 4px;
       }

В состав пакета Zen Coding планируется включить скрипт, который будет автоматически сортировать выделенные группы свойств согласно упомянутому алгоритму. Это позволит не только легко научиться новому порядку сортировки, но и привести в порядок существующий или чужой код.

Также планируется отдельная публикация с теоритическими выкладками по поводу группировки и сортировки CSS-свойств. Возможно, в составе обновлённой версии статьи «CSS-менеджмент».

## Алло, таланты!

Сейчас я продемонстрировал вам концепцию будущих пакетов Zen Coding. Для дальнейших шагов по её реализации осталось только найти соавтора или соавторов, которые согласны не только помочь мне реализовать эту функциональность, но и, возможно, заняться поддержкой, развитием и портированием пакетов для других редакторов. Большая часть алгоритмов написана, остальная дописывается и ждёт своего часа, чтобы быть реализованной в пакетах Zen Coding не только для TextMate, но и для всех редкторов, что поддерживают плагины: [Coda](http://panic.com/coda/), [Espresso](http://macrabbit.com/espresso/), [IntelliJ IDEA](http://www.jetbrains.com/idea/) и многих других.

Если вы используете TextMate, знаете на хорошем уровне какой-нибудь скриптовый язык вроде Python, Ruby, Perl или даже PHP, и хотите написать что-нибудь такое или портировать Zen Coding для своего любимого редактора — смелее, пишите мне: [pepelsbey@gmail.com](mailto:pepelsbey@gmail.com).

Проект по-прежнему планируется держать на [Google Code](http://code.google.com/p/zen-coding/), но помимо этого будет открыт отдельный сайт с документацией и примерами — [zen-coding.ru](http://zen-coding.ru/)

Как обычно, с интересом жду ваших мнений по поводу озвученной концепции развития пакетов Zen Coding.
