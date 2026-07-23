import * as express from 'express';
import * as multer from 'multer';
import * as path from 'path';

import { getConfigValue } from '../configuration';
import { SERVICE_CASE_WORKER_PATH } from '../configuration/references';
import { fieldName, getFormData, getHeaders, getUploadFileUrl } from './util';

const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const INVALID_UPLOAD_FILE_TYPE_ERROR = 'INVALID_UPLOAD_FILE_TYPE';
const missingUploadFileErrorDescription = 'You need to select a file to upload. Please try again.';
const invalidUploadFileContentErrorDescription = 'The selected file must be a valid Excel spreadsheet.';
const allowedExcelFileExtensions = ['.xls', '.xlsx'];
const allowedExcelMimeTypes = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
const xlsxMagicBytes = Buffer.from([0x50, 0x4b]);
const xlsMagicBytes = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const storage = multer.memoryStorage();

// Keep memory-backed uploads bounded to reduce memory exhaustion risk.
export const uploadLimits = {
  fileSize: MAX_UPLOAD_FILE_SIZE_BYTES,
  files: 1,
  parts: 6,
  fields: 5,
  fieldNameSize: 100,
  fieldSize: 1024 * 1024
};

export function isAllowedExcelFile(file: Pick<Express.Multer.File, 'originalname' | 'mimetype'>): boolean {
  // Check both extension and MIME type before accepting the upload into memory.
  const extension = path.extname(file.originalname).toLowerCase();
  return allowedExcelFileExtensions.includes(extension) && allowedExcelMimeTypes.includes(file.mimetype);
}

export function hasExcelMagicBytes(file: Pick<Express.Multer.File, 'buffer'>): boolean {
  // Reject renamed/spoofed files that do not have an Excel-compatible file signature.
  return file.buffer.subarray(0, xlsxMagicBytes.length).equals(xlsxMagicBytes)
    || file.buffer.subarray(0, xlsMagicBytes.length).equals(xlsMagicBytes);
}

function excelFileFilter(
  req: express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
): void {
  if (isAllowedExcelFile(file)) {
    callback(null, true);
    return;
  }
  callback(new Error(INVALID_UPLOAD_FILE_TYPE_ERROR));
}

const upload = multer({ storage, limits: uploadLimits, fileFilter: excelFileFilter });

const uploadLimitErrorDescriptions = {
  LIMIT_FILE_SIZE: `The selected file must be smaller than ${MAX_UPLOAD_FILE_SIZE_BYTES / (1024 * 1024)}MB.`,
  LIMIT_FILE_COUNT: 'You can only upload one file.',
  LIMIT_PART_COUNT: 'Too many form parts were submitted.',
  LIMIT_FIELD_COUNT: 'Too many form fields were submitted.',
  LIMIT_FIELD_KEY: 'One or more form field names are too long.',
  LIMIT_FIELD_VALUE: 'One or more form fields are too large.',
  LIMIT_UNEXPECTED_FILE: 'The selected file field is not supported.'
};

type UploadLimitErrorCode = keyof typeof uploadLimitErrorDescriptions;

function isUploadLimitErrorCode(code: string): code is UploadLimitErrorCode {
  return Object.prototype.hasOwnProperty.call(uploadLimitErrorDescriptions, code);
}

function isInvalidUploadFileTypeError(error: unknown): boolean {
  return error instanceof Error && error.message === INVALID_UPLOAD_FILE_TYPE_ERROR;
}

export function handleUploadError(error: unknown, res: express.Response, next: express.NextFunction): void {
  // Convert expected upload validation failures into client-displayable 400 responses.
  if (isInvalidUploadFileTypeError(error)) {
    res.status(400);
    res.send({ errorDescription: 'The selected file must be an Excel spreadsheet with .xls or .xlsx extension.' });
    return;
  }
  if (error instanceof multer.MulterError && isUploadLimitErrorCode(error.code)) {
    res.status(400);
    res.send({ errorDescription: uploadLimitErrorDescriptions[error.code] });
    return;
  }
  next(error);
}

function uploadSingleFile(req: express.Request, res: express.Response, next: express.NextFunction): void {
  upload.single(fieldName)(req, res, (error: unknown) => {
    if (error) {
      handleUploadError(error, res, next);
      return;
    }
    next();
  });
}

async function caseWorkerDetailsRoute(req: any, res: express.Response): Promise<void> {
  if (!req.file) {
    res.status(400);
    res.send({ errorDescription: missingUploadFileErrorDescription });
    return;
  }
  if (!hasExcelMagicBytes(req.file)) {
    res.status(400);
    res.send({ errorDescription: invalidUploadFileContentErrorDescription });
    return;
  }
  const formData = getFormData(req.file);
  const headers = getHeaders(formData);
  const baseCaseWorkerUrl = getConfigValue(SERVICE_CASE_WORKER_PATH);
  const uploadUrl = getUploadFileUrl(baseCaseWorkerUrl);
  try {
    const { status, data } = await req.http.post(uploadUrl, formData, headers);
    res.status(status);
    res.send(data);
  } catch (error) {
    if (error?.status) {
      res.status(Number(error.status) || 500);
    }
    if (error?.data) {
      res.send(error.data);
    }
  }
}

export const router = express.Router({ mergeParams: true });

router.post('/', uploadSingleFile, caseWorkerDetailsRoute);

export default router;
