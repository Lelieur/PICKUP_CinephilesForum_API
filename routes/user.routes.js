const {
    filterUsers,
    getUser,
    getAllUsersPopulated,
    getAllUsers,
    editUser
} = require('../controllers/user.controllers')

const express = require('express')
const User = require('../models/User.model')

const router = express.Router()

router.get('/users', getAllUsers)
router.get('/users/detailed', getAllUsersPopulated)
router.get('/users/:id', getUser)
router.put('/users/:id', editUser)

router.get('/users/search/:querySearch', async (req, res, next) => {
    const { querySearch } = req.params

    try {
        const response = await filterUsers(querySearch)
        console.log(response)
        res.json(response)
    }
    catch (error) {
        next(error)
    }
})

module.exports = router