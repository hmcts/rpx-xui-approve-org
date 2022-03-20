
const pbaErrorMessages = ['There is a problem. Enter a PBA number, for example PBA1234567'];
const pbaServerErrorMessages = 'There is problem with the services, please try again later';
const pbaErrorAlreadyUsedMessages = ['This PBA number xxxxxxxxxx has already been used.' +
                                     'You should check that the PBA has been entered' +
                                     'correctly.You should also check if your organisation' +
                                     'has already been registered.If you are still having' +
                                     'problems, contact HMCTS.'];

const statusCodes = {
  serverErrors: [0, 500, 502, 503, 504]
};

export class OrgManagerConstants {
  public static PBA_ERROR_MESSAGES = pbaErrorMessages;
  public static PBA_ERROR_ALREADY_USED_MESSAGES = pbaErrorMessages;
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
