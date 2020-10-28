const {conf} = require('../config/config');
class Actions{
   

    waitForurl(url){
        return ['wait for url to be '+url];

    }

    navigateTourl(url) {
        return ['navigate to '+url,'wait for url to be ' + url];

    }

<<<<<<< HEAD
=======
    checkField(cssLocator){
        return ['wait for element ' + cssLocator + ' to be visible', 'check field ' + cssLocator]
    }

    uncheckField(cssLocator) {
        return ['wait for element ' + cssLocator + ' to be visible' , 'uncheck field ' + cssLocator]
    }


>>>>>>> master
    waitForPageWithCssLocator(cssLocator) {
        return ['wait for element ' + cssLocator+' to be visible'];

    }

<<<<<<< HEAD
=======
    waitForPageWithCssLocatorNotPresent(cssLocator) {
        return ['wait for element ' + cssLocator + ' to be hidden'];

    }


>>>>>>> master
    inputField(cssLocator,inputText) {
        return ['set field ' + cssLocator+' to ' + inputText];

    }

    clickElement(cssLocator) {
<<<<<<< HEAD
        return ['click element ' + cssLocator ];
=======
        return ['wait for element ' + cssLocator + ' to be visible', 'click element ' + cssLocator ];
>>>>>>> master

    }

}

module.exports = new Actions();

