

class DecisionConformPage{

    constructor(){
        this.header = element(by.xpath(`//h1[contains(text(),'Confirm your decision')]`))

        this.orgName = element(by.xpath(`//dt[contains(text(),'Name')]/../dd`))
        this.decision = element(by.xpath(`//dt[contains(text(),'Decision')]/../dd`))

        this.confirmButton = $('.govuk-button')
    }
}

module.exports = new DecisionConformPage()
