const {
    filterUsers,
    getUser,
    getAllUsers
} = require('../controllers/user.controllers')

const verifyToken = require("./../middlewares/verifyToken")

const express = require('express')

const router = express.Router()

router.get('/users', getAllUsers)

router.get('/users/:id', getUser)

router.get('/users/search', filterUsers)

module.exports = router