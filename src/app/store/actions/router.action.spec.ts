import * as fromRouter from './router.action';

describe('Router Actions', () => {
  describe('Go', () => {
    it('should create an action', () => {
      const payload = {
        path: ['/home'],
        query: { page: 1 },
        extras: { skipLocationChange: true }
      };
      const action = new fromRouter.Go(payload);

      expect({ ...action }).toEqual({
        type: fromRouter.GO,
        payload
      });
    });
  });

  describe('Back', () => {
    it('should create an action', () => {
      const action = new fromRouter.Back();

      expect({ ...action }).toEqual({
        type: fromRouter.BACK
      });
    });
  });
});
