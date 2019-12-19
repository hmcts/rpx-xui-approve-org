# rpx-xui-approve-org

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.

Therefore it requires you to install Angular CLI:
`npm install -g @angular/cli`

## Environmental Variables Setup & Error Handling

`NODE_CONFIG_DIR` should be set on the environment. It should point to a /config directory where configuration .yaml files reside. 
`NODE_CONFIG_ENV` is used to select which .yaml configuration file to use. ie. 'aat', 'prod', 'ithc'; the NODE_CONFIG_ENV needs to match
the name of the .yaml file.

- We check that the Developer has NODE_CONFIG_ENV set, otherwise we throw the error: Error: NODE_CONFIG_ENV is not set. Please make sure you have the NODE_CONFIG_ENV 
setup in your environmental variables.

- If NODE_CONFIG_DIR=/Users/*/projects/rpx-xui-approve-org/config is set incorrectly 'NODE_CONFIG_ENV value of 'x' did not match any deployment config file names.' will appear to the Developer.
Which means that the NODE_CONFIG_ENV does not match a .yaml file within /config directory.

- We do not need a specific check for NODE_CONFIG_DIR within our code, like we have a specific check for NODE_CONFIG_ENV,
as Node-config does this for us.

- We give feedback to the Developer as to what configuration file we are using. 'NODE_CONFIG_ENV is set as aat therefore using we are using 
the AAT ENVIRONMENT config.'

- If the NODE_CONFIG_ENV is not set, the application falls over to use default.yaml which is the default configuration file for Node-config.
We should place all Production values into development.yaml as well as prod.yaml. So if something does go wrong with NODE_CONFIG_ENV
we default to the production variables. Reform standard*

- Note that we DO NOT use or change NODE_ENV=production on any of the environments as NODE_ENV=production is being used
for template caching and other reform things, therefore it needs to be set as NODE_ENV.

- WARNING: Do not place a local.yaml file into the /config directory otherwise it will OVERRIDE all other files. We've made sure that it never gets
placed into the repository as it's in the .gitignore file.

- We DO use development.yaml for development locally.

## Development Environmental Variables Setup

export IDAM_SECRET=* && export S2S_SECRET=* && export NODE_CONFIG_DIR=/Users/*/projects/rpx-xui-approve-org/config && export NODE_CONFIG_ENV=development && npm run start:node

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:3000/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Integration Documentation

https://tools.hmcts.net/confluence/display/EUI/EXUI+Low+Level+Design

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Setup notes

To build you need to run `npm run build` which will run the ng build first and then the
node build.

Then your /dist folder will be populated with both the /api folder for the node backend and the ng assets for the frontend, within it.

#Issues

If you get the following issues, try the resolution underneath.

Issue: Module build failed: Error: ENOENT: no such file or directory, scandir '/Users/philip/Projects/prd-pui-manager/node_modules/node-sass/vendor'
Resolution: try `npm rebuild node-sass`

