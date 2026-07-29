type MockPaginationPayload = {
  searchRequest?: {
    pagination_parameters?: {
      page_number?: number;
      page_size?: number;
    };
  };
};

export function paginateMockItems<T>(items: T[], payload: MockPaginationPayload | undefined): T[] {
  const pagination = payload?.searchRequest?.pagination_parameters;
  if (!pagination) {
    return items;
  }

  const pageNumber = pagination.page_number ?? 1;
  const pageSize = pagination.page_size ?? items.length;
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return items.slice(startIndex, endIndex > items.length ? items.length : endIndex);
}
