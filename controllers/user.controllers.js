const mongoose = require('mongoose')
const User = require('../models/User.model')

const getUser = (req, res, next) => {
    const { id: userId } = req.params


    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "User ID format is not valid" });
    }

    User
        .findById(userId)
        .populate('reviews')
        .populate('communities')
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }
            res.json(user)
        })
        .catch(err => {
            console.error("Error fetching user:", err)
            next(err)
        })
}

const editUser = (req, res, next) => {

    const { _id, firstName, bio, email, username, socialNetworksProfiles, favoriteGenres, role, communities, reviews } = req.body

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "User ID format is not valid" });
    }

    User
        .findByIdAndUpdate(
            _id,
            { firstName, bio, email, username, socialNetworksProfiles, favoriteGenres, role, communities, reviews },
            { runValidators: true }
        )
        .then(() => res.sendStatus(200))
        .catch(err => next(err))

}

const getAllUsers = (req, res, next) => {
    const { page = 1, limit = 10 } = req.query


    User
        .find()
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .then(users => {
            if (users.length === 0) {
                return res.status(404).json({ message: "No users found" });
            }
            res.json(users)
        })
        .catch(err => {
            console.error("Error fetching users:", err)
            next(err)
        })
}

const getAllUsersPopulated = (req, res, next) => {
    const { page = 1, limit = 10 } = req.query


    User
        .find()
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('reviews')
        .populate('communities')
        .then(users => {
            if (users.length === 0) {
                return res.status(404).json({ message: "No users found" });
            }
            res.json(users)
        })
        .catch(err => {
            console.error("Error fetching users:", err)
            next(err)
        })
}


const filterUsers = (req, res, next) => {
    const { query } = req.query


    if (!query) {
        return res.status(400).json({ message: "Please provide a search term" })
    }

    const querySearch = { username: { $regex: query, $options: 'i' } }
    User
        .find(querySearch)
        .then(users => {
            if (users.length === 0) {
                return res.status(404).json({ message: "No users found matching the search" })
            }
            res.json(users)
        })
        .catch(err => {
            console.error("Error searching users:", err)
            next(err)
        })
}

module.exports = {
    getUser,
    editUser,
    getAllUsersPopulated,
    filterUsers,
    getAllUsers
}
