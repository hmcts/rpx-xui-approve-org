function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasNonEmptyStringField(item: Record<string, unknown>, key: string): boolean {
  return typeof item[key] === 'string' && item[key].trim() !== '';
}

export function resolveHeader(headers: Record<string, string>, key: string): string {
  const expected = key.toLowerCase();
  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (headerName.toLowerCase() === expected) {
      return headerValue;
    }
  }
  return '';
}

export function organisationsListShapeErrors(payload: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(payload)) {
    errors.push('payload is not an array');
    return errors;
  }

  payload.forEach((item, index) => {
    if (!isObject(item)) {
      errors.push(`payload[${index}] is not an object`);
      return;
    }

    const organisationIdentifier = item.organisationIdentifier;
    if (typeof organisationIdentifier !== 'string' || organisationIdentifier.trim() === '') {
      errors.push(`payload[${index}].organisationIdentifier is missing or empty`);
    }

    if (item.status !== undefined && typeof item.status !== 'string') {
      errors.push(`payload[${index}].status is not a string`);
    }
  });

  return errors;
}

export function pbaAccountsShapeErrors(payload: unknown): string[] {
  const errors: string[] = [];

  if (!Array.isArray(payload)) {
    errors.push('payload is not an array');
    return errors;
  }

  payload.forEach((item, index) => {
    if (!isObject(item)) {
      errors.push(`payload[${index}] is not an object`);
      return;
    }

    const hasAccountName = hasNonEmptyStringField(item, 'account_name');
    const hasKnownErrorText =
      hasNonEmptyStringField(item, 'message') ||
      hasNonEmptyStringField(item, 'error') ||
      hasNonEmptyStringField(item, 'errorMessage') ||
      hasNonEmptyStringField(item, 'apiError');
    const hasKnownErrorCode =
      typeof item.status === 'number' ||
      typeof item.statusCode === 'number' ||
      typeof item.code === 'number' ||
      hasNonEmptyStringField(item, 'code');

    if (!hasAccountName && !hasKnownErrorText && !hasKnownErrorCode) {
      errors.push(`payload[${index}] does not match known account/error shape`);
    }
  });

  return errors;
}

export function pbaAccountsMissingParameterErrors(payload: unknown): string[] {
  const errors: string[] = [];

  if (!isObject(payload)) {
    errors.push('payload is not an object');
    return errors;
  }

  if (typeof payload.apiError !== 'string' || !payload.apiError.toLowerCase().includes('account is missing')) {
    errors.push('payload.apiError is missing expected message');
  }

  const statusCode = payload.apiStatusCode;
  if (statusCode !== undefined && statusCode !== '400' && statusCode !== 400) {
    errors.push('payload.apiStatusCode is not 400');
  }

  if (payload.message !== undefined && typeof payload.message !== 'string') {
    errors.push('payload.message is not a string');
  }

  return errors;
}

export function searchEnvelopeShapeErrors(payload: unknown): string[] {
  const errors: string[] = [];

  if (!isObject(payload)) {
    errors.push('payload is not an object');
    return errors;
  }

  if (!Array.isArray(payload.organisations)) {
    errors.push('payload.organisations is not an array');
  }

  const totalRecords = payload.total_records;
  const isNumber = typeof totalRecords === 'number';
  const isNumericString = typeof totalRecords === 'string' && totalRecords.trim() !== '' && !Number.isNaN(Number(totalRecords));
  if (!isNumber && !isNumericString) {
    errors.push('payload.total_records is not a number or numeric string');
  }

  return errors;
}
