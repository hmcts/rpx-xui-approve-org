/* eslint-disable semi */
import { SortOrder } from '../../enums/sort-order';

export default interface SortField {
  fieldName: string;
  order: SortOrder;
}
