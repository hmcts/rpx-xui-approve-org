import { PendingOrganisationsMockCollection2 } from '../mock/pending-organisation.mock';
import { FilterOrganisationsPipe } from './filter-organisations.pipe';

describe('FilterOrganisationsPipe', () => {

  let pipe: FilterOrganisationsPipe;

  beforeEach(() => {
      pipe = new FilterOrganisationsPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('providing no value returns fallback empty array', () => {
    expect(pipe.transform(null, 'test').length).toBeLessThanOrEqual(0);
  });

  it('able to search the organisation name lower case or upper case', () => {
    const filterResult = pipe.transform(PendingOrganisationsMockCollection2, 'Glen');
    expect(filterResult.length).toBe(1);
    const filterResult2 = pipe.transform(PendingOrganisationsMockCollection2, 'glen');
    expect(filterResult2.length).toBe(1);
  });

  it('able to search the pba number correctly', () => {
    const filterResult = pipe.transform(PendingOrganisationsMockCollection2, '271093');
    expect(filterResult.length).toBe(1);
  });

});
