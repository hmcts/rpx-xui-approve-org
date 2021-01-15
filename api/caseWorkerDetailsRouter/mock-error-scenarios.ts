
export function getErrorResponse(req, res) {
    const fileName = req.files[0].originalname
    switch (fileName) {
    //this is for 400 error
    case 'fileName-400.xlsx':
        return {status: 400, json: {
           error_code: 400,
           status: 'BAD_REQUEST',
           error_message: 'Missing column headers',
           error_description: 'File is missing the required column headers. Please check the file',
           timestamp: Date.now()
        }}
    case 'fileName-400-2.xlsx':
        return {status: 400, json: {
           error_code: 400,
           status: 'BAD_REQUEST',
           error_message: 'Invalid file format',
           error_description: 'File provided in request is not in xls(x) format',
           timestamp: Date.now()
        }}
    case 'fileName-401.xlsx':
        return {status: 401, json: {
           error_code: 401,
           status: 'Authentication failure',
           error_message: 'Unauthorised request',
           error_description: 'Request has not been applied because it lacks valid authentication credentials for the target resource',
           timestamp: Date.now()
        }}
    case 'fileName-403.xlsx':
        return {status: 403, json: {
           error_code: 401,
           status: 'Unauthorised request',
           error_message: 'Unauthorised request',
           error_description: 'Request has not been applied since user does not have sufficient access to call this API',
           timestamp: Date.now()
        }}
    case 'fileName-500.xlsx': 
        return {status: 500, json: {
           error_code: 500,
           status: 'Internal Server Error',
           error_message: 'Request Failed. Please try again',
           error_description: 'Database connection error',
           timestamp: Date.now()
        }}
    default: 
        return null
    }
}

export function getPartialSuccess(req, res) {
    if(req.files[0].originalname === 'fileName-200-partial.xlsx') {
      const partialResponse =  {
            message: "Request completed with partial success. Some records failed during validation and were ignored.",
            message_details : "<count> record(s) failed validation, <count> record(s) uploaded, and <count> record(s) suspended",
            error_details: [
                {
                row_id: "excel row id #2",
                field_in_error: "primary_location",
                error_description: "Primary base location must not be empty"
            }
            ]
        }
        return partialResponse
    }
    return null
}
