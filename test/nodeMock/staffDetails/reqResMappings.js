const Mockdata  = require('./mockData')

const reqResMappings = {
    get : {

    },
    post: {
        '/api/caseworkerdetails' : (req,res) => {
            res.status(200).send(Mockdata.getSuccess());
        }
    }
}

module.exports = reqResMappings;

