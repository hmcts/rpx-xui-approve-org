/**
 * Feed to create inputs for changing the PBA
 */
const pbaInputFeed = [
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

const pbaErrorMessages = ['There is a problem. Enter a PBA number, for example PBA1234567'];
const pbaServerErrorMessages = 'There is problem with the services, please try again later';

const statusCodes = {
  serverErrors: [0, 500, 502, 503, 504]
};



export class OrgManagerConstants {
  public static PBA_INPUT_FEED = pbaInputFeed;
  public static PBA_ERROR_MESSAGES = pbaErrorMessages;
  public static STATUS_CODES = statusCodes;
  public static PBA_SERVER_ERROR_MESSAGE = pbaServerErrorMessages;
}

/**
 * Feed to create inputs for changing the PBA
 */
export class PBAConfig {
  public label: string;
  public hint: string;
  public name: string;
  public id: string;
  public type: string;
  public classes: string;
}

