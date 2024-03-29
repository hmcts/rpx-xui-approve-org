
const express = require('express');
const minimist = require('minimist');

const { requestMapping, configurations } = require('./reqResMapping');
const { browser } = require('protractor');
// const nodeMockAvailablePort = require('./availablePortFinder').getAvailablePort();
const port = 3001;

class MockApp{
  init(){
    this.conf = {
      get: { ...requestMapping.get },
      post: { ...requestMapping.post },
      put: { ...requestMapping.put },
      delete: { ...requestMapping.delete }
    };
    this.configurations = Object.assign({}, configurations);
    console.log('Mock Config Initialized');
    return 'done';
  }

  async startServer(){
    const app = express();
    for (const [key, value] of Object.entries(this.conf.get)) {
      app.get(key, value);
    }

    for (const [key, value] of Object.entries(this.conf.post)) {
      app.post(key, value);
    }

    for (const [key, value] of Object.entries(this.conf.put)) {
      app.put(key, value);
    }

    for (const [key, value] of Object.entries(this.conf.delete)) {
      app.delete(key, value);
    }

    this.server = await app.listen(8080);
    console.log('mock api started');
    // return "Mock started successfully"
  }

  async stopServer(){
    await this.server.close();
    // this.conf = {  };
    // this.configurations = {};
  }

  onGet(path, callback){
    this.conf.get[path] = callback;
  }

  onPost(path, callback){
    this.conf.post[path] = callback;
  }

  onPut(path, callback){
    this.conf.put[path] = callback;
  }

  onDelete(path, callback){
    this.conf.delete[path] = callback;
  }

  setConfig(configKey, value){
    this.configurations[configKey] = value;
  }
}

const mockInstance = new MockApp();
module.exports = mockInstance;

const args = minimist(process.argv);
if (args.standalone) {
  mockInstance.init();
  // createCustomCCDCaseConfig();
  mockInstance.startServer();
}

