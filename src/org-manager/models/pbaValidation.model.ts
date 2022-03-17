export interface PBAValidationContainerModel {
  validation: PBAValidationModel;
}

export interface PBAValidationModel {
  isInvalid: {[key: string]: any[]};
  errorMsg: string[];
}
