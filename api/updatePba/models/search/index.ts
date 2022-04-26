export interface DrillDownSearch {
  field_name: string;
  search_filter: string;
}

export interface OrganisationSearchParameter {
  ccdId?: string;
  eventId?: string;
  jurisdiction?: string[];
  location?: string[];
  postEventState?: string;
  preEventState?: string;
  state?: string[];
  user?: string[];
}

export interface SearchOrganisationRequest {
  search_filter?: string;
  sorting_parameters: SortParameter[];
  search_by?: string;
  pagination_parameters?: PaginationParameter;
}

export interface SearchPBARequest {
  search_filter?: string;
  sorting_parameters: SortParameter[];
  search_by?: string;
  pagination_parameters?: PaginationParameter;
  drill_down_search?: DrillDownSearch[];
}

export interface SearchOrganisationParameter {
  key: string;
  operator: string;
  values: string[];
}

export interface SortParameter {
  sort_by: string;
  sort_order: string;
}

export interface OrganisationSearchParameters {
  parameters: OrganisationSearchParameter[];
}

export interface PaginationParameter {
  page_number: number;
  page_size: number;
}
