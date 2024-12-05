const {
    getCreditDetails,
    findCredit
} = require("../controllers/credit.controllers")

const router = require("express").Router()

router.get('/persons/:id', getCreditDetails)

router.get('/persons/search/:querySearch', findCredit)

module.exports = router