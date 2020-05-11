export default {
  formGroupValidators: [],
  groups: [
    {
      fieldset: [
        {
          radios: {
            classes: 'govuk-radios--inline',
            control: 'haveDXNumber',
            radioGroup: [
              {
                hiddenAccessibilityText: 'some hidden text',
                text: 'Yes',
                value: 'nextUrl',
              },
              {
                hiddenAccessibilityText: 'some hidden text',
                text: 'No',
                value: 'dontHaveDX',
              },
            ],
          },
        },
      ],
    },
    {
      hiddenInput: {
        control: 'nextUrl',
        value: 'organisation-dx',
      },
    },
    {
      hiddenInput: {
        control: 'dontHaveDX',
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
  header: "Do you have a DX reference for your main office?",
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
