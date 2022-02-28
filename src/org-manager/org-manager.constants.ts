
const pbaErrorMessages = ['There is a problem. Enter a PBA number, for example PBA1234567'];
const pbaServerErrorMessages = 'There is problem with the services, please try again later';

const statusCodes = {
  serverErrors: [0, 500, 502, 503, 504]
};

export class OrgManagerConstants {
  static PBA_ERROR_MESSAGES = pbaErrorMessages;
  static STATUS_CODES = statusCodes;
  static PBA_SERVER_ERROR_MESSAGE = pbaServerErrorMessages;
}

/**
 * Feed to create inputs for changing the PBA
 */
export class PBAConfig {
  label: string
  hint: string
  name: string
  id: string
  type: string
  classes: string
}
