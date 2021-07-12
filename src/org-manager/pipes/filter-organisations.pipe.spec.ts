import { PendingOrganisationsMockCollection2 } from '../mock/pending-organisation.mock';
import { FilterOrganisationsPipe } from './filter-organisations.pipe';

describe('FilterOrganisationsPipe', () => {

  let pipe: FilterOrganisationsPipe;

  beforeEach(() => {
      pipe = new FilterOrganisationsPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty array when providing no value', () => {
    expect(pipe.transform(null, 'test').length).toEqual(0);
  });
  it('should return an empty array when the value contains a null', () => {
    expect(pipe.transform([null], 'test').length).toEqual(0);
  });
  it('should return all organisations when there is no search filter', () => {
    expect(pipe.transform(PendingOrganisationsMockCollection2, '').length).toEqual(PendingOrganisationsMockCollection2.length);
  });
  it('should match against the name, regardless of case', () => {
    expect(pipe.transform(PendingOrganisationsMockCollection2, 'Glen').length).toEqual(1);
    expect(pipe.transform(PendingOrganisationsMockCollection2, 'glen').length).toEqual(1);
    expect(pipe.transform(PendingOrganisationsMockCollection2, 'GLEN').length).toEqual(1);
  });
  it('should partially match against the name, regardless of case', () => {
    expect(pipe.transform(PendingOrganisationsMockCollection2, 'Gl').length).toEqual(1);
    expect(pipe.transform(PendingOrganisationsMockCollection2, 'len').length).toEqual(1);
    expect(pipe.transform(PendingOrganisationsMockCollection2, 'GLE').length).toEqual(1);
  });
  it('should return no results when nothing matches', () => {
    expect(pipe.transform(PendingOrganisationsMockCollection2, 'NOT TO BE FOUND').length).toEqual(0);
  });
  it('able to search the pba number correctly', () => {
    expect(pipe.transform(PendingOrganisationsMockCollection2, '271093').length).toBe(1);
    expect(pipe.transform(PendingOrganisationsMockCollection2, '271094').length).toBe(1);
    expect(pipe.transform(PendingOrganisationsMockCollection2, '101010').length).toBe(1);
  });
  it('able to search the pba number with a partial match', () => {
    expect(pipe.transform(PendingOrganisationsMockCollection2, '27109').length).toBe(2);
  });

});
