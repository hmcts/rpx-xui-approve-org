
class MockData{
  getErrorResponse(status) {
    switch (status) {
      //this is for 400 error
      case '400':
        return {
          'errorCode': 400,
          'status': 'Bad Request',
          'errorMessage': 'Mock error',
          'errorDescription': 'Mock test error description',
          'timeStamp': '12-02-2021 10:11:36.468'
        };

      case '400-2':
        return {
          error_code: 400,
          status: 'BAD_REQUEST',
          error_message: 'Invalid file format',
          error_description: 'File provided in request is not in xls(x) format',
          timestamp: Date.now()
        };
      case '401':
        return {
          error_code: 401,
          status: 'Authentication failure',
          error_message: 'Unauthorised request',
          error_description: 'Request has not been applied because it lacks valid authentication credentials for the target resource',
          timestamp: Date.now()
        };
      case '403':
        return {
          error_code: 401,
          status: 'Unauthorised request',
          error_message: 'Unauthorised request',
          error_description: 'Request has not been applied since user does not have sufficient access to call this API',
          timestamp: Date.now()
        };
      case '500':
        return {
          error_code: 500,
          status: 'Internal Server Error',
          error_message: 'Request Failed. Please try again',
          error_description: 'Database connection error',
          timestamp: Date.now()
        };
      default:
        return null;
    }
  }

  getPartialSuccess() {
    const partialResponse = {
      message: 'Request completed with partial success. Some records failed during validation and were ignored.',
      message_details: '3 record(s) failed validation, 1 record(s) uploaded, and 0 record(s) suspended',
      error_details: [
        {
          row_id: 2,
          field_in_error: 'primary_location',
          error_description: 'Primary base location must not be empty'
        }
      ]
    };
    return partialResponse;
  }

  getSuccess() {
    return { message: 'Request Completed Successfully', message_details: '2 record(s) uploaded and 0 record(s) marked as suspended' };
  }
}

module.exports = new MockData();
