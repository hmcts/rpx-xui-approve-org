/**
 * Feed to create inputs for changing the PBA
 */
const pbaInputFeed =  [
  {
    config: {
      label: 'PBA number 1 (optional)',
      hint: '',
      name: 'pba1',
      id: 'pba1',
      type: 'text',
      classes: ''
    },
  },
  {
    config: {
      label: 'PBA number 2 (optional)',
      hint: '',
      name: 'pba2',
      id: 'pba2',
      type: 'text',
      classes: ''
    }
  }
];

const pbaErrorMessages =  [
  'Enter a PBA number, for example PBA1234567'
];



export class OrgManagerConstants {
  static PBA_INPUT_FEED = pbaInputFeed;
  static PBA_ERROR_MESSAGES = pbaErrorMessages;

}
