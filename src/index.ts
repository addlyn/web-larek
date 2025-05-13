import './scss/styles.scss';

import { AppStatus, CardItem, CatalogChangeEvent } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { LarekApi } from './components/LarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Modal } from './components/common/Modal';
import { Basket } from './components/Basket';

const events = new EventEmitter();
const api = new LarekApi(CDN_URL, API_URL);

events.onAll(({eventName, data}) => {
    console.log(eventName, data);
})

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const appStatus = new AppStatus({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);

events.on<CatalogChangeEvent>('items:changed', () => {
  page.catalog = appStatus.catalog.map(item => {
    const card = new Card(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item)
    });
    return card.render({
      category: item.category,
      title: item.title,
      image: item.image,
      price: item.price,
    });
  });
});

events.on('card:select', (item: CardItem) => {
  appStatus.setPreview(item);
});

events.on('preview:changed', (item: CardItem) => {
  const card = new Card(cloneTemplate(cardPreviewTemplate), {
    onClick: () => {
      events.emit('item:check', item);
      card.buttonText = appStatus.basket.indexOf(item) < 0 ? 
      'В корзину' : 
      'Убрать из корзины';
    }
  })

  modal.render({
    content: card.render({
      category: item.category,
      title: item.title,
      image: item.image,
      description: item.description,
      price: item.price,
      buttonText: appStatus.basket.indexOf(item) < 0 ? 
      'В корзину' : 
      'Убрать из корзины',
    })
  })
});

events.on('item:check', (item: CardItem) => {
  (appStatus.basket.indexOf(item) < 0) ?
  events.emit('item:add', item) :
  events.emit('item:delete', item);
});

events.on('item:add', (item: CardItem) => {
  appStatus.addItemToBasket(item);
})

events.on('item:delete', (item: CardItem) => {
  appStatus.deleteItemFromBasket(item);
})

events.on('basket:changed', (items: CardItem[]) => {
  basket.items = items.map((item, count) => {
    const card = new Card(cloneTemplate(cardBasketTemplate), {
      onClick: () => {events.emit('item:delete', item)}
    });
    return card.render({
      title: item.title,
      price: item.price,
      count: (count++).toString(),
    });
  });
  let total = 0;
  items.forEach(item => {
    total = total + item.price;
  });
  basket.total = total;
  appStatus.order.total = total;
});

events.on('count:changed', () => {
  page.counter = appStatus.basket.length;
});

events.on('basket:open', () => {
  modal.render({
    content: basket.render({})
  });
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