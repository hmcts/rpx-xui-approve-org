

const express = require('express')

const router = express.Router({ mergeParams: true });
const service = require('./index')

const userApiData = require('../userApiData')


router.get('/v1/organisations', (req, res) => {
    const queryKeys = Object.keys(req.query)
    if (queryKeys.includes('status')){
        res.header({ total_records: 500 }).send(service.getOrganisationsWithStatus(req.query.status, req.query.page, req.query.size))
    }else{
        res.send(service.getOrganisationWithStatus(req.query.id))
    }
});


router.get('/v2/organisations', (req, res) => {
    const queryKeys = Object.keys(req.query)
    if (queryKeys.includes('status')) {
        res.header({ total_records: 500 }).send(service.getOrganisationsWithStatus(req.query.status, req.query.page, req.query.size))
    } else {
        res.send(service.getOrganisationWithStatus(req.query.id))
    }
});

router.get('/v1/organisations/:orgid/users' , (req,res) => {
    const getUsers = service.getOrganisationUsers(req.params.orgid, req.query.page, req.query.size)
    res.send(getUsers)
})


router.put('/v1/organisations/:orgId' , (req,res) => {
    res.status(200).send({})
});


router.delete('/v1/organisations/:orgid', (req, res) => {
    res.status(200).send({})
});


module.exports = router;