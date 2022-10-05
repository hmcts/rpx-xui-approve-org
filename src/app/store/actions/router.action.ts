import { NavigationExtras } from '@angular/router';
import { Action } from '@ngrx/store';

export const GO = '[Router] Go';
export const BACK = '[Router] Back';

export class Go implements Action {
  public readonly type = GO;
  constructor(
    public payload: {
      path: any[];
      query?: object;
      extras?: NavigationExtras;
    }
  ) {}
}

export class Back implements Action {
  public readonly type = BACK;
}

export type Actions = Go | Back;
