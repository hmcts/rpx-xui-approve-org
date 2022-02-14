export enum RequestType {
  APPROVE_REQUEST = 'Approve it',
  REJECT_REQUEST = 'Reject it',
  REVIEW_REQUEST = 'Place registration under review pending further investigation',
}
export interface ErrorMessage {
  title: string;
  description: string;
  fieldId?: string;
}
export interface DisplayedRequest {
  request: RequestType;
  checked: boolean;
}
export enum RequestErrors {
  NO_SELECTION = 'Select what would you like to do with this registration',
  GENERIC_ERROR = 'There is a problem',
}
