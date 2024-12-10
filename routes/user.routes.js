const {
    filterUsers,
    getUser,
    getAllUsersPopulated,
    getAllUsers,
    editUser
} = require('../controllers/user.controllers')

const express = require('express')

const router = express.Router()

router.get('/users', getAllUsers)
router.get('/users/detailed', getAllUsersPopulated)
router.get('/users/:id', getUser)
router.put('/users/:id', editUser)
router.get('/users/search', filterUsers)

module.exports = router