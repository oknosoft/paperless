import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Repl from './Repl';

class DumbScreen extends Component {

  renderRepl(footer) {
    let text = 'Чтение справочников';
    const res = [<Repl key="ram" info={{text}}/>];
    footer && res.push(<div key="footer">{footer}</div>);
    return res;
  }

  render() {

    let {title, page, top, repl} = this.props;
    const over = page && page.limit * page.page > page.total_rows;

    if(!title && repl && repl.root) {
      title = repl.root.title;
    }
    if(!title) {
      title = 'Загрузка модулей...';
    }

    const footer = page ? (over ?
      <div>{`Такт №${page.page}, загружено ${page.total_rows} объектов - чтение изменений `} <i className="fa fa-spinner fa-pulse"></i></div>
      :
      page.text || `Такт №${page.page}, загружено ${page.docs_written} из ${page.total_rows} объектов`)
      : '';

    return <div className='splash' style={{marginTop: top}}>
      <div className="description">
        {[
          <h1 key="name" itemProp="name">Заказ дилера - безбумажка</h1>,
          <p key="category">Категория: <span itemProp="applicationSubCategory">CRM, CAD, E-Commerce</span></p>,
          <p key="platform">Платформа: <i className="fa fa-chrome" aria-hidden="true"></i> браузер Chrome для <span
            itemProp="operatingSystem">Windows 8, 10 | Android | Mac | iOS</span>
          </p>,
          <div key="description" itemProp="description">
            <p>Веб-сервис <a href="https://business-programming.ru/articles/implementation_of_the_windowbuilder"
                             title="Программы для оконных заводов и дилеров"
                             target="_blank" rel="noopener noreferrer">Заказ дилера</a>, предназначен для:</p>
            <ul>
              <li>Расчета геометрии, спецификации и стоимости оконных и витражных конструкций (ПВХ, Дерево, Алюминий)</li>
              <li>Aвтоматизации работы менеджеров и дилеров</li>
              <li>Ускорения и упрощения подготовки производства</li>
              <li>Планирования и контроля на всех этапах</li>
            </ul>
          </div>
        ]}
      </div>

      <div style={{paddingTop: '30px'}}>
        <div>{title}</div>
        {this.renderRepl(page && footer)}
      </div>

    </div>;
  }
}

DumbScreen.propTypes = {
  step: PropTypes.number,
  step_size: PropTypes.number,
  count_all: PropTypes.number,
  top: PropTypes.number,
  title: PropTypes.string,
  processed: PropTypes.string,
  current: PropTypes.string,
  bottom: PropTypes.string,
  page: PropTypes.object,
  repl: PropTypes.object,
};

export default DumbScreen;
