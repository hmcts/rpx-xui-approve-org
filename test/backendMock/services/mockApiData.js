
class MockAPIData{


    setApiData(apiMethod, responseData){
        let status = "success"
        switch (apiMethod) {
            default:
                status = `${req.params.apiMethod} is not setup`
        }
        return status;
    }

}

module.exports = new MockAPIData()

