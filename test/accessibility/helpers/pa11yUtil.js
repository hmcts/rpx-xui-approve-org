

const pa11y = require('pa11y');
const assert = require('assert');
const {conf} = require('../config/config');

<<<<<<< HEAD
=======
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');

>>>>>>> master

const fs = require('fs');


async function pa11ytest(test,actions,timeoutVal) {
    console.log("pally test with actions : " + test.test.title);
    console.log(actions);

    let screenshotPath = process.env.PWD + "/" + conf.reportPath + 'assets/';
    if (!fs.existsSync(screenshotPath)) {
        fs.mkdirSync(screenshotPath, { recursive: true });
    }
    screenshotName = Date.now() + '.png'; 
    screenshotPath = screenshotPath + Date.now()+'.png';
    screenshotReportRef = 'assets/' + screenshotName;

    const startTime = Date.now();

<<<<<<< HEAD
    let result;
    try{
        result = await pa11y(conf.baseUrl, {
            "chromeLaunchConfig": { "ignoreHTTPSErrors": false , headless:true } ,
            timeout: 60000,
            screenCapture: screenshotPath,
            // log: {
            //     debug: console.log,
            //     error: console.error,
            //     info: console.info
            // },
            actions: actions
        })
    }catch(err){
        const elapsedTime = Date.now() - startTime;
        console.log("Test Execution time : " + elapsedTime);
        console.log(err);
        throw err;
    }
   
=======
    let token = jwt.sign({
    data: 'foobar'
    }, 'secret', { expiresIn: 60 * 60 });

    const cookies = [
        {
        name: '__auth__',
        value: token,
        domain: 'localhost:4200',
        path: '/',
        httpOnly: false,
        secure: false,
        session: true,
        }
    ];
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: false,
        headless: conf.headless 
    });
    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.goto("http://localhost:4200/");


    let result;
    try{

        result = await pa11y(conf.baseUrl, {
                browser: browser,
                page: page,
            timeout: 60000,
            screenCapture: screenshotPath,
            log: {
                debug: console.log,
                error: console.error,
                info: console.info
            },
            actions: actions
        })
    }catch(err){
        await page.screenshot({ path: screenshotPath});
        const elapsedTime = Date.now() - startTime;
        result = {}; 
        result.executionTime = elapsedTime;
        result.screenshot = screenshotReportRef;
        test.a11yResult = result;
        console.log("Test Execution time : " + elapsedTime);
        console.log(err);
        await page.close();
        await browser.close();
        throw err;

    }
  
    await page.close();
    await browser.close();
>>>>>>> master
    const elapsedTime = Date.now() - startTime;
    result.executionTime = elapsedTime;
    result.screenshot = screenshotReportRef;
    test.a11yResult = result;
    console.log("Test Execution time : "+elapsedTime);
<<<<<<< HEAD
    assert(result.issues.length === 0, "accessibility issues reported") 
=======
    if (conf.failTestOna11yIssues){
        assert(result.issues.length === 0, "a11y issues reported") 
    }
>>>>>>> master
    return result;

}

<<<<<<< HEAD
=======
 

>>>>>>> master
module.exports = { pa11ytest}
