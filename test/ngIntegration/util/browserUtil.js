const { browser, promise } = require("protractor");
const jwt = require('jsonwebtoken');
const axios = require('axios'); 

class BrowserUtil{

    async gotoHomePage(){
        await browser.get("http://localhost:4200/"); 
    }

    setAuthCookie(){
        let token = jwt.sign({
            data: 'foobar'
        }, 'secret', { expiresIn: 60 * 60 });
        this.addCookie('__auth__', token);
        
    }

    addCookie(cookieName, cookieVal){
        const cookie = {
            name: cookieName,
            value: cookieVal,
            domain: 'localhost:4200',
            path: '/',
            httpOnly: false,
            secure: false,
            session: true,
        };
        browser.manage().addCookie(cookie);
    }
        
    async browserInitWithAuth(roles){
        await this.gotoHomePage();
        this.setAuthCookie();

        if(roles){
            console.log("j:" + JSON.stringify(roles));
            const encodedRoles = encodeURIComponent("j:" + JSON.stringify(roles))
            console.log(encodedRoles);
            this.addCookie('roles', encodedRoles);
        }

        await this.gotoHomePage();
    }

    async waitForLD(){
        let startTime = new Date();
        let elapsedTime = 0;
        let ldDone = false;
        let ldUrl = "";
        while (!ldDone && elapsedTime < 15) {
            let perf = await browser.executeScript("return window.performance.getEntriesByType('resource')");
            perf.forEach(async ( perfitem) => {
                if (perfitem.name.includes('app.launchdarkly.com/sdk/evalx')) {
                    ldUrl = perfitem.name; 
                    ldDone = true;
                    // await browser.sleep(2000);
                } 
            }); 
            elapsedTime = (new Date() - startTime)/1000;
        }

        return (await axios.get(ldUrl)).data; 
    }


}

module.exports = new BrowserUtil();