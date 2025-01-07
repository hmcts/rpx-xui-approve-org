const { When, Given } = require('@cucumber/cucumber');

Given('I save page url with reference {string}', async function(ref){
    const pageUrl = await browser.getCurrentUrl()
    global.scenarioData[ref] = pageUrl
})

When('I navigate to url with ref {string}', async function (ref) {
    const pageUrl = global.scenarioData[ref]
    await browser.get(pageUrl)
})
