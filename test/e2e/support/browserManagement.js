
class BrowserManager{

   async getCookies(){
    return await browser.manage().getCookies(); 
   }
   
   async getCookie(cookieName){
    let cookiesObj = await this.getCookies();
    let returnObj = null;
    for(let cookieCtr = 0; cookieCtr < cookiesObj.length;cookieCtr++){
        let cookieObj = cookiesObj[cookieCtr];
        if (cookieObj.name === cookieName){
            returnObj = cookieObj;
            break;
        }
    }
    return returnObj;
   }
}

module.exports = new BrowserManager();