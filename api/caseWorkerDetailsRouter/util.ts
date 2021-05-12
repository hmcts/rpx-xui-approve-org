import * as FormData from 'form-data';
import { Readable } from 'form-data';

export const fieldName = 'file';

export interface MulterRequest {
  /** `Multer.File` object populated by `single()` middleware. */
  file: File;
  /**
   * Array or dictionary of `Multer.File` object populated by `array()`,
   * `fields()`, and `any()` middleware.
   */
  files: {
      [fieldname: string]: File[];
  } | File[];
}

export interface File {
  fieldname: string;
  /** Name of the file on the uploader's computer. */
  originalname: string;
  /**
   * Value of the `Content-Transfer-Encoding` header for this file.
   * @deprecated since July 2015
   * @see RFC 7578, Section 4.7
   */
  encoding: string;
  /** Value of the `Content-Type` header for this file. */
  mimetype: string;
  /** Size of the file in bytes. */
  size: number;
  /**
   * A readable stream of this file. Only available to the `_handleFile`
   * callback for custom `StorageEngine`s.
   */
  stream: Readable;
  /** `DiskStorage` only: Directory to which this file has been uploaded. */
  destination: string;
  /** `DiskStorage` only: Name of this file within `destination`. */
  filename: string;
  /** `DiskStorage` only: Full path to the uploaded file. */
  path: string;
  /** `MemoryStorage` only: A Buffer containing the entire file. */
  buffer: Buffer;
}

export const multipartFormData = 'multipart/form-data';

export function getContentType(contentType: string, formData: FormData) {
  return `${contentType}; boundary=${formData.getBoundary()}`
}

export function getFormData(file: File): FormData {
  const formData = new FormData();
  formData.append(fieldName, file.buffer, file.originalname);
  return formData;
}

export function getHeaders(formData: FormData): any {
  return {
    headers:  {'Content-Type': getContentType(multipartFormData, formData)}
  };
}

export function getUploadFileUrl(url: string): string {
  return `${url}/refdata/case-worker/upload-file`;
}
