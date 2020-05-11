export default {
    formGroupValidators: [],
    groups: [
      {
          hiddenInput: {
              control: 'nextUrl',
              value: 'organisation-address',
          },
      },
    {
      input: {
        classes: '',
        control: 'orgName',
        label: {
          classes: 'govuk-label--m',
          text: '',
        },
        validationError: {
          controlId: 'orgName',
          value: 'Enter Organisation Name',
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
    header: "What's the name of your organisation?",
    idPrefix: 'tbc',
    name: 'organisation-name',
    'validationHeaderErrorMessages': [
      {
        controlId: 'orgName',
        href: '/register/organisation-name',
        text: 'Enter organisation name',
        validationLevel: 'formControl',
      },
    ],
}
