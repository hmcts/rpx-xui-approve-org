
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
