export default {
    formGroupValidators: [],
    groups: [
        {
            hiddenInput: {
                control: 'nextUrl',
                value: 'organisation-pba',
            },
        },
        {
            input: {
                classes: '',
                control: 'officeAddressOne',
                label: {
                    classes: 'govuk-label--m',
                    text: 'Building and street',
                },
                validationError: {
                    controlId: 'officeAddressOne',
                    value: 'Enter Building and street',
                },
                validators: ['required'],
            },
        },
        {
            input: {
                classes: '',
                control: 'officeAddressTwo',
                validationError: {
                    controlId: 'officeAddressTwo',
                    value: 'Enter the length of hearing in minutes, for example "20"',
                },

            },
        },
        {
            input: {
                classes: 'govuk-!-width-two-thirds',
                control: 'townOrCity',
                label: {
                    classes: 'govuk-label--m',
                    text: 'Town or city',
                },
                validationError: {
                    controlId: 'townOrCity',
                    value: 'Enter town or city',
                },
                validators: ['required'],
            },
        },
        {
            input: {
                classes: 'govuk-!-width-two-thirds',
                control: 'county',
                label: {
                    classes: 'govuk-label--m',
                    text: 'County',
                },
            },
        },
        {
            input: {
                classes: 'govuk-input--width-10',
                control: 'postcode',
                label: {
                    classes: 'govuk-label--m',
                    text: 'Postcode',
                },
                validationError: {
                    controlId: 'Poscode',
                    value: 'Enter enter postcode',
                },
                validators: ['required'],
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
    header: "What's the address of your main office?",
    idPrefix: 'tbc',
    name: 'organisation-address',
    validationHeaderErrorMessages: [
        {
            controlId: 'officeAddressOne',
            href: '/register/organisation-address',
            text: 'Enter Building and street',
            validationLevel: 'formControl',
        },
        {
            controlId: 'townOrCity',
            href: '/register/organisation-address',
            text: 'Enter town or city',
            validationLevel: 'formControl',
        },
        {
            controlId: 'postcode',
            href: '/register/organisation-address',
            text: 'Enter postcode',
            validationLevel: 'formControl',
        },
    ],
}
