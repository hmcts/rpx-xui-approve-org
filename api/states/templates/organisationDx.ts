export default {
    formGroupValidators: [],
    groups: [
        {
            hiddenInput: {
                control: 'nextUrl',
                value: 'name',
            },
        },
        {
            input: {
                classes: 'govuk-!-width-two-thirds',
                control: 'DXnumber',
                label: {
                    classes: 'govuk-label--m',
                    text: 'DX number',
                },
                validationError: {
                  controlId: 'DXnumber',
                  value: 'Enter DX number',
                },
                validators: ['required'],
            },
        },
        {
            input: {
                classes: 'govuk-!-width-two-thirds',
                control: 'DXexchange',
                label: {
                    classes: 'govuk-label--m',
                    text: 'DX exchange',
                },
                validationError: {
                    controlId: 'DXexchange',
                    value: 'Enter DX exchange',
                  },
                validators: ['required'],
            },
        },
        {
            hiddenInput: {
                control: 'nextUrl',
                value: 'name',
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
    header: "What's the DX reference for your main office? (optional)",
    idPrefix: 'tbc',
    name: 'organisation-dx',
    'validationHeaderErrorMessages': [
      {
        controlId: 'DXnumber',
        href: '/register/organisation-name',
        text: 'Enter DX number',
        validationLevel: 'formControl',
      },
      {
        controlId: 'DXexchange',
        href: '/register/organisation-name',
        text: 'EnterDX exchange',
        validationLevel: 'formControl',
      },
    ],
}
