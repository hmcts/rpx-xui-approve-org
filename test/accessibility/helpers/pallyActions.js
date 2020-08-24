const {conf} = require('../config/config');
class Actions{
   

    waitForurl(url){
        return ['wait for url to be '+url];

    }

    navigateTourl(url) {
        return ['navigate to '+url,'wait for url to be ' + url];

    }

    checkField(cssLocator){
        return ['wait for element ' + cssLocator + ' to be visible', 'check field ' + cssLocator]
    }

    uncheckField(cssLocator) {
        return ['wait for element ' + cssLocator + ' to be visible' , 'uncheck field ' + cssLocator]
    }


    waitForPageWithCssLocator(cssLocator) {
        return ['wait for element ' + cssLocator+' to be visible'];

    }

    inputField(cssLocator,inputText) {
        return ['set field ' + cssLocator+' to ' + inputText];

    }

    clickElement(cssLocator) {
        return ['wait for element ' + cssLocator + ' to be visible', 'click element ' + cssLocator ];

    }

}

module.exports = new Actions();

