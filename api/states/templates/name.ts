export default {
    formGroupValidators: [],
    groups: [
        {
            hiddenInput: {
                control: 'nextUrl',
                value: 'email-address',
            },
        },
        {
            input: {
                classes: 'govuk-!-width-two-thirds',
                control: 'firstName',
                hint: {
                    classes: 'govuk-hint',
                    text: 'Include all middle names.',
                },
                label: {
                    classes: 'govuk-label--m',
                    text: 'First name(s)',
                },
                validationError: {
                    controlId: 'firstName',
                    value: 'Enter first name',
                },
                validators: ['required'],
            },
        },
        {
            input: {
                classes: 'govuk-!-width-two-thirds',
                control: 'lastName',
                label: {
                    classes: 'govuk-label--m',
                    text: 'Last name',
                },
                validationError: {
                    controlId: 'lastName',
                    value: 'Enter last name',
                },
                validators: ['required'],
            },
        },
        {
            hiddenInput: {
                control: 'nextUrl',
                value: 'email-address',
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
    header: "What's your name?",
    idPrefix: 'tbc',
    name: 'name',
    validationHeaderErrorMessages: [
        {
            controlId: 'firstName',
            href: '/register/organisation-address',
            text: 'Enter first name',
            validationLevel: 'formControl',
        },
        {
            controlId: 'lastName',
            href: '/register/organisation-address',
            text: 'Enter Last Name',
            validationLevel: 'formControl',
        },
    ],
}
