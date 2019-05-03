export interface IProduct {
    productId: number;
    productName: string;
    productCode: string;
    releaseDate: string;
    price: number;
    description: string;
    starRating: number;
    imageUrl: string;
    name: string;
    address: string;
    status: string | 'Active';
    effective_date: string;
    dx_exchange: string;
    pbaNumber: string;
    dxNumber: string;
    dxExchange: string;
    admin: string;
  }