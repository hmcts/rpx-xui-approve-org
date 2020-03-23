export default {
    formGroupValidators: [],
    groups: [
        {
            hiddenInput: {
                control: 'nextUrl',
                value: 'check',
            },
        },
        {
            input: {
                classes: '',
                control: 'emailAddress',
                validationError: {
                    controlId: 'emailAddress',
                    value: 'Enter email address',
                },
                validators: ['required', 'email'],
            },
        },
        {
            hiddenInput: {
                control: 'nextUrl',
                value: 'check',
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
    header: "What's your email address?",
    idPrefix: 'tbc',
    name: 'email-address',
    validationHeaderErrorMessages: [
        {
            controlId: 'emailAddress',
            href: '/register/organisation-address',
            text: 'Enter email address',
            validationLevel: 'formControl',
        },
    ],
}
