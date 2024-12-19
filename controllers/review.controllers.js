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
            const orderedReviews = unOrderedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            res.json(orderedReviews)
        })
        .catch(err => next(err))
}


const getReviewsFromMovie = (req, res, next) => {

    const { movieId: movieApiId } = req.params

    Review
        .find({ movieApiId })
        .sort({ rate: -1 })
        .limit(10)
        .populate("author")
        .then(reviews => res.json(reviews))
        .catch(err => next(err))
}

const getLastReviewedMovies = (req, res, next) => {

    Review
        .find()
        .then(response => {

            const unOrderedReviews = response
            const orderedReviews = unOrderedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

            const moviesId = orderedReviews.map(review => { return review.movieApiId })
            const filteredMoviesId = moviesId.filter((value, index) => moviesId.indexOf(value) === index)

            const moviesPromises = filteredMoviesId.map(elm => tmdbServices.fetchMovieDetails(elm))

            return Promise.all(moviesPromises)
        })
        .then(movies => {

            const moviesData = movies.map(elm => {
                const { original_title, backdrop_path, poster_path, id } = elm.data

                const movieData = {
                    original_title: original_title,
                    backdrop_path: backdrop_path,
                    poster_path: poster_path,
                    id: id
                }

                return movieData
            })

            res.json(moviesData)
        })
        .catch(err => next(err))
}

const getMostReviewedMovies = (req, res, next) => {

    Review
        .find()
        .then(response => {

            const moviesId = response.map(review => { return review.movieApiId })

            const repeatedMovies = moviesId.reduce((acc, id) => {
                acc[id] = (acc[id] || 0) + 1
                return acc;
            }, {})

            const sortedRepeatedMovies =
                Object
                    .entries(repeatedMovies)
                    .filter(([_, count]) => count > 1)
                    .sort((a, b) => b[1] - a[1])

            const idsInOrder = sortedRepeatedMovies.map(([id]) => id)

            const moviesPromises = idsInOrder.map(id => tmdbServices.fetchMovieDetails(id))

            return Promise.all(moviesPromises)
        })
        .then(movies => {

            const moviesData = movies.map(elm => {
                const { original_title, backdrop_path, poster_path, id } = elm.data

                const movieData = {
                    original_title: original_title,
                    backdrop_path: backdrop_path,
                    poster_path: poster_path,
                    id: id
                }

                return movieData
            })

            res.json(moviesData)
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

const saveReview = async (req, res, next) => {

    try {
        const { movieApiId, content, rate, author } = req.body

        const movieDetails = await tmdbServices
            .fetchMovieDetails(movieApiId)
            .then(movie => {
                const movieData = movie.data
                const { original_title, poster_path, release_date, id } = movieData
                const filteredMovideData = {
                    original_title: original_title,
                    poster_path: poster_path,
                    release_date: release_date,
                    id: id
                }
                return filteredMovideData
            })

        const review = await Review.create({ author, movieApiId, content, rate })

        await User.findByIdAndUpdate(
            author,
            { $push: { reviews: review._id } },
            { new: true, runValidators: true }
        )

        const reviewWithAuthor = await Review.findById(review._id).populate({
            path: 'author',
            select: 'avatar firstName username',
        })

        res.status(201).json({ ...reviewWithAuthor._doc, ["movieApiId"]: movieDetails })
    } catch (err) {
        next(err)
    }
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
        .populate({ path: 'author', select: 'avatar firstName username' })
        .then(review => {

            originalReview = review

            const { movieApiId } = review

            return movieData = tmdbServices.fetchMovieDetails(movieApiId)
        })
        .then((movie) => {

            const movieData = movie.data

            const { original_title, poster_path, release_date, id: movieId } = movieData

            const { _id, content, rate, likesCounter, createdAt, author } = originalReview

            const newReview = {
                _id,
                content,
                rate,
                likesCounter,
                createdAt,
                author,
                movieApiId: {
                    id: movieId,
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
    getOneReviewFullData,
    getLastReviewedMovies,
    getMostReviewedMovies
}