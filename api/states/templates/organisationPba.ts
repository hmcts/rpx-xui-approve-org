export default {
    formGroupValidators: [],
    groups: [
        {
            input: {
                classes: 'govuk-!-width-two-thirds',
                control: 'PBAnumber1',
                label: {
                    classes: 'govuk-label--m',
                    text: 'PBA number 1 (optional)',

                },
            },
        },
        {
            input: {
                control: 'PBAnumber2',
                label: {
                    classes: 'govuk-label--m',
                    text: 'PBA number 2 (optional)',
                },

                classes: 'govuk-!-width-two-thirds',
            },
        },
        {
            hiddenInput: {
                control: 'nextUrl',
                value: 'organisation-have-dx',
            },
        },
        {
            button: {
                classes: '',
                control: 'createButton',
                onEvent: 'continue',
                type: 'submit',
                value: 'Continue',
            },
        },
    ],
    header: "What's your payment by account (PBA) number for your organisation?",
    idPrefix: 'tbc',
    name: 'organisation-pba',
}
