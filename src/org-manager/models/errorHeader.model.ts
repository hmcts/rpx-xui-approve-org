export class ErrorHeader {
  public header: string;
  public isFromValid: boolean;
  public items: {
    id: string;
    message: any;
  } [];
}
