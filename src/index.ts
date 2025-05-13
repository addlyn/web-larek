import './scss/styles.scss';

import { AppStatus, CardItem, CatalogChangeEvent } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

events.onAll(({eventName, data}) => {
    console.log(eventName, data);
})

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog')

const appStatus = new AppStatus({}, events);

const page = new Page(document.body, events);

events.on<CatalogChangeEvent>('items:changed', () => {
  page.catalog = appStatus.cards.map(item => {
    const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      category: item.category,
      title: item.title,
      image: item.image,
      price: item.price,
    })
  })
});

events.on('modal:open', () => {
  page.locked = true;
});

events.on('modal:close', () => {
  page.locked = false;
});



api.getCardsList()
	.then(appStatus.setCards.bind(appStatus))
	.catch((err) => {
		console.error(err);
});