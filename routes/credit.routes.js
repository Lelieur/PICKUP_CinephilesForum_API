const {
    getCreditDetails,
    findCredit,
    findDirector,
    findActor
} = require("../controllers/credit.controllers")

const router = require("express").Router()

router.get('/persons/:id', getCreditDetails)

router.get('/persons/search/:querySearch', findCredit)

router.get('/persons/directors/search/:querySearch', findDirector)

router.get('/persons/actors/search/:querySearch', findActor)


module.exports = router