export interface CaseWorkerRefDataUploadResponse {
  message: string,
  message_details: string,
  error_details: CaseWorkerRefUploadErrorDetail[]
}

export interface CaseWorkerRefUploadErrorDetail {
  error_description: string,
  field_in_error: string,
  row_id: number
}
