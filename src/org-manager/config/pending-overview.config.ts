export const PendingOverviewColumnConfig = [
    { header: null, key: null, type: 'checkbox' },
    {
        header: 'Reference', key: 'organisationId', type: 'multi-column', multiColumnMapping: 'id',
        class: 'govuk-caption-m govuk-!-font-size-16'
    },
    { header: 'Address', key: 'address' },
    {
        header: 'Administrator', key: 'admin', type: 'multi-column',
        multiColumnMapping: 'email', class: 'govuk-caption-m govuk-!-font-size-16'
    },
    { header: 'Status', key: 'status', type: 'styled', class: 'hmcts-badge' },
    { header: null, key: 'view', type: 'link' }
];
