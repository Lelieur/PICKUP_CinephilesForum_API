const mongoose = require('mongoose')

const Review = require('../models/Review.model')
const User = require('../models/User.model')

const tmdbServices = require("./../services/tmdb.services")
const axios = require('axios')

const getAllReviews = (req, res, next) => {

    Review
        .find()
        .then(response => {
            const unOrderedReviews = response
            unOrderedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            res.json(unOrderedReviews)
        })
        .catch(err => next(err))
}


const getMostLikedReviews = (req, res, next) => {

    Review
        .find()
        .sort({ likesCounter: -1 })
        .limit(10)
        .then(reviews => res.json(reviews))
        .catch(err => next(err))
}

const getReviewsFromMovie = (req, res, next) => {

    const { movieId: movieApiId } = req.params

    Review
        .find({ movieApiId })
        .sort({ rate: -1 })
        .limit(10)
        .then(reviews => res.json(reviews))
        .catch(err => next(err))
}

const getReviewsFromAuthor = (req, res, next) => {

    const { authorId: author } = req.params

    if (!mongoose.Types.ObjectId.isValid(author)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }

    Review
        .find({ author })
        .sort({ rate: -1 })
        .limit(10)
        .then(reviews => res.json(reviews))
        .catch(err => next(err))
}


const getOneReview = (req, res, next) => {

    const { id: reviewId } = req.params

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }

    Review
        .findById(reviewId)
        .then(review => res.json(review))
        .catch(err => next(err))
}

const saveReview = (req, res, next) => {

    const { movieApiId, content, rate, author } = req.body

    console.log(`hasta aquí llega`)

    Review
        .create({ author, movieApiId, content, rate })
        .then(review => {
            res.status(201).json(review)
            return (review._id)
        })
        .then(reviewId => {

            User
                .findByIdAndUpdate(
                    author,
                    { $push: { reviews: reviewId } },
                    { new: true, runValidators: true }
                )
                .then()
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

const editReview = (req, res, next) => {

    const { movieApiId, content, rate, likesCounter } = req.body
    const { id: reviewId } = req.params


    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }

    Review
        .findByIdAndUpdate(
            reviewId,
            { movieApiId, content, rate, likesCounter },
            { runValidators: true }
        )
        .then(updatedReview => {
            if (!updatedReview) {
                return res.status(404).json({ message: "Review not found" })
            }
            res.status(200).json(updatedReview)
        })
        .catch(err => next(err))
}

const deleteReview = (req, res, next) => {

    const { id: reviewId } = req.params

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }

    Review
        .findById(reviewId)
        .then(review => { return review })
        .then(review => {
            const { author } = review

            User
                .findByIdAndUpdate(
                    author,
                    { $pull: { reviews: reviewId } },
                    { new: true, runValidators: true }
                )
                .then()
                .catch(err => next(err))

        })
        .catch(err => next(err))


    Review
        .findByIdAndDelete(reviewId)
        .then(() => res.sendStatus(200))
        .catch(err => next(err))
}

const filterReviews = (query) => {

    const newQuery = query

    if (!query) {
        return res.status(400).json({ message: "Introduce un término de búsqueda" })
    }

    const querySearch = {
        $or: [
            { movieApiId: { $regex: newQuery, $options: 'i' } },
            { content: { $regex: newQuery, $options: 'i' } },
            { movieName: { $regex: newQuery, $options: 'i' } },
            { content: { $regex: newQuery, $options: 'i' } },
            { userName: { $regex: newQuery, $options: 'i' } }
        ]
    }

    return Review
        .find(querySearch)
        .then(reviews => reviews)
        .catch(err => next(err))
}

const likeReview = (req, res, next) => {

    const { _id: userId } = req.body
    const { id: reviewId } = req.params

    Review
        .findByIdAndUpdate(
            reviewId,
            {
                $push: { usersLikes: userId },
                $inc: { likesCounter: 1 }
            },
            { new: true, runValidators: true }
        )
        .then(response => res.json(response))
        .then(() => {

            User
                .findByIdAndUpdate(
                    userId,
                    { $push: { likedReviews: reviewId } },
                    { new: true, runValidators: true }
                )
                .then()
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

const dislikeReview = (req, res, next) => {

    const { _id: userId } = req.body
    const { id: reviewId } = req.params

    Review
        .findByIdAndUpdate(
            reviewId,
            {
                $pull: { usersLikes: userId },
                $inc: { likesCounter: -1 }
            },
            { new: true, runValidators: true }
        )
        .then(response => res.json(response))
        .then(() => {

            User
                .findByIdAndUpdate(
                    userId,
                    { $pull: { likedReviews: reviewId } },
                    { new: true, runValidators: true }
                )
                .then()
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

const getOneReviewFullData = (req, res, next) => {

    const { id: reviewId } = req.params

    let originalReview

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }

    Review
        .findById(reviewId)
        .then(review => {

            originalReview = review

            const { movieApiId, author } = review

            const movieDataPromise = tmdbServices.fetchMovieDetails(movieApiId)

            const authorDataPromise = axios.get(`http://localhost:5005/api/users/${author}`)

            return Promise.all([movieDataPromise, authorDataPromise])
        })

        .then(([movie, author]) => {

            const authorData = author.data
            const movieData = movie.data

            const { original_title, poster_path, release_date } = movieData
            const { avatar, username, firstName, _id: authorId } = authorData

            const { _id, content, rate, likesCounter, createdAt } = originalReview

            const newReview = {
                _id,
                content,
                rate,
                likesCounter,
                createdAt,
                author: {
                    _id: authorId,
                    avatar: avatar,
                    username: username,
                    firstName: firstName
                },
                movieApiId: {
                    original_title: original_title,
                    poster_path: poster_path,
                    release_date: release_date
                },
            }

            res.json(newReview)

        })
        .catch(err => next(err))
}




module.exports = {
    getAllReviews,
    getReviewsFromMovie,
    getReviewsFromAuthor,
    getMostLikedReviews,
    saveReview,
    getOneReview,
    editReview,
    deleteReview,
    filterReviews,
    likeReview,
    dislikeReview,
    getOneReviewFullData
}