
export function getErrorResponse(req, res) {
    //this is for 400 error
    if(req.files[0].originalname === 'fileName-400.xlsx') {
         return {status: 400, json: {
            error_code: 400,
            status: 'BAD_REQUEST',
            error_message: 'Missing column headers',
            error_description: 'File is missing the required column headers. Please check the file',
            timestamp: Date.now()
         }}
    }
    return null
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
