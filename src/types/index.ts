export type CardId = string; //uuid?


export type EventName = string | RegExp;
export type Subscriber = Function;
export type EmitterEvent = {
    eventName: string,
    data: unknown
};

export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
  }

export type ApiListResponse<Type> = {
  total: number,
  items: Type[]
};

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';


export interface ILarekApi {
    getCardsList: () => Promise<ICard[]>;
    getCard: (id: string) => Promise<ICard>;
    orderProducts: (order: IOrder) => Promise<IOrderSuccess>
  }
  
export interface IAppStatus {
    catalog: ICard[];
    basket: ICard[];
    preview: string | null;
    delivery: IOrdersDelivery | null;
    contact: IOrdersContacts | null;
    order: IOrder | null;
  }


export type Payment = 'online' | 'cash' | '';

export interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export interface ICard {
    id: string,
    description: string,
    image: string,
    title: string,
    category: string,
    price: number | null,
    count?: string,
    buttonText? : string;
}

export interface IOrdersDelivery {
    payment: string,
    address: string,
}

export interface IOrdersContacts {
    email: string,
    phone: string,
}

export interface IOrder extends IOrdersDelivery, IOrdersContacts {
    total: number | null,
    items: CardId[],
}

export interface IOrderSuccess {
    id: string, 
    total: number | null,
}

export interface ISuccess {
    image: string,
    title: string,
    description: string,
    total: number | null,
}

export interface IBasket {
    items: HTMLElement[];
    total: number;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IActions {
    onClick: (event: MouseEvent) => void;
}

export interface ISuccessActions {
    onClick: () => void;
}