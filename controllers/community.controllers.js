const axios = require('axios')

const mongoose = require('mongoose')
const Community = require('./../models/Community.model')
const User = require('./../models/User.model')

const tmdbServices = require("./../services/tmdb.services")

const getCommunities = (req, res, next) => {

    Community
        .find()
        .select({ title: 1, cover: 1, genres: 1 })
        .then(communities => res.json(communities))
        .catch(err => next(err))
}

const getOneCommunity = (req, res, next) => {

    const { id: communityId } = req.params

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }

    Community
        .findById(communityId)
        .then(community => {
            res.json(community)
        })
        .catch(err => next(err))

}

const getOneCommunityFullData = (req, res, next) => {

    const { id: communityId } = req.params

    let originalCommunity

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }

    Community
        .findById(communityId)
        .then(community => {

            originalCommunity = community

            const { moviesApiIds, users, fetishActors, fetishDirectors, owner } = community

            const moviesPromises = moviesApiIds.map(elm => tmdbServices.fetchMovieDetails(elm))
            const actorsPromises = fetishActors.map(elm => tmdbServices.fetchPersonDetails(elm))
            const directorsPromises = fetishDirectors.map(elm => tmdbServices.fetchPersonDetails(elm))
            const usersPromises = users.map(elm => axios.get(`http://localhost:5005/api/users/${elm}`))

            const ownerPromise = axios.get(`http://localhost:5005/api/users/${owner}`)

            return Promise.all
                ([
                    Promise.all(moviesPromises),
                    Promise.all(actorsPromises),
                    Promise.all(directorsPromises),
                    Promise.all(usersPromises),
                    ownerPromise
                ])

        })
        .then(([movies, actors, directors, users, owner]) => {

            const ownerData = owner.data

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

            const usersData = users.map(elm => elm.data)

            const actorsData = actors.map(elm => {
                const { name, profile_path, id } = elm.data

                const actorData = {
                    name: name,
                    profile_path: profile_path,
                    id: id
                }

                return actorData
            })

            const directorsData = directors.map(elm => {

                const { name, profile_path, id } = elm.data

                const directorData = {
                    name: name,
                    profile_path: profile_path,
                    id: id
                }

                return directorData
            })

            const { _id, title, description, cover, genres, decades } = originalCommunity

            const newCommunity = {
                _id: _id,
                title: title,
                description: description,
                cover: cover,
                genres: genres,
                fetishDirectors: directorsData,
                fetishActors: actorsData,
                decades: decades,
                moviesApiIds: moviesData,
                users: usersData,
                owner: ownerData
            }

            res.json(newCommunity)

        })
        .catch(err => next(err))
}

const saveCommunity = (req, res, next) => {

    const { title, description, cover, genres, fetishDirectors, fetishActors, decades, moviesApiIds, users, owner } = req.body

    Community
        .create({ title, description, cover, genres, fetishDirectors, fetishActors, decades, moviesApiIds, users, owner })
        .then(community => {
            res.status(201).json(community)
            return (community._id)
        })
        .then(communityId => {

            User
                .findByIdAndUpdate(
                    owner,
                    { $push: { communities: communityId } },
                    { new: true, runValidators: true }
                )
                .then()
                .catch(err => next(err))

        })
        .catch(err => next(err))

}

const followCommunity = (req, res, next) => {

    const { _id: userId } = req.body
    const { id: communityId } = req.params

    Community
        .findByIdAndUpdate(
            communityId,
            { $push: { users: userId } },
            { new: true, runValidators: true }
        )
        .then(response => {
            User
                .findByIdAndUpdate(
                    userId,
                    { $push: { followedCommunities: communityId } },
                    { new: true, runValidators: true }
                )
                .then(response => {
                    res.sendStatus(200)
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))

}

const unFollowCommunity = (req, res, next) => {

    const { _id: userId } = req.body
    const { id: communityId } = req.params

    Community
        .findByIdAndUpdate(
            communityId,
            { $pull: { users: userId } },
            { runValidators: true }
        )
        .then(() => {
            User
                .findByIdAndUpdate(
                    userId,
                    { $pull: { followedCommunities: communityId } },
                    { runValidators: true }
                )
                .then(() => res.sendStatus(200))
                .catch(err => next(err))
        })
        .catch(err => next(err))
}

const editCommunity = (req, res, next) => {

    const { title, description, cover, genres, fetishDirectors, fetishActors, decades, moviesApiIds, users } = req.body
    const { id: communityId } = req.params

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }

    Community
        .findByIdAndUpdate(
            communityId,
            { title, description, cover, genres, fetishDirectors, fetishActors, decades, moviesApiIds, users },
            { runValidators: true }
        )
        .then(() => res.sendStatus(200))
        .catch(err => next(err))
}

const deleteCommunity = (req, res, next) => {

    const { id: communityId } = req.params

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        res.status(404).json({ message: "Id format not valid" });
        return
    }


    Community
        .findById(communityId)
        .then(community => { return community })
        .then(community => {
            console.log(community)
            const { owner } = community

            User
                .findByIdAndUpdate(
                    owner,
                    { $pull: { communities: communityId } },
                    { new: true, runValidators: true }
                )
                .then()
                .catch(err => next(err))

        })
        .catch(err => next(err))

    Community
        .findByIdAndDelete(communityId)
        .then(() => res.sendStatus(200))
        .catch(err => next(err))

}

const filterCommunities = (query) => {

    const newQuery = query

    if (!query) {
        return res.status(400).json({ message: "Introduce un término de búsqueda" });
    }

    const querySearch = {
        $or: [
            { title: { $regex: newQuery } },
            { description: { $regex: newQuery, $options: 'i' } },
            { genres: { $regex: newQuery, $options: 'i' } },
            { fetishDirectors: { $regex: newQuery, $options: 'i' } },
            { fetishActors: { $regex: newQuery, $options: 'i' } },
            { decades: parseInt(newQuery) || undefined },
            { moviesApiIds: newQuery }
        ]

    }


    return Community
        .find(querySearch)
        .then(communities => communities)
        .catch(err => console.log(err))
}


module.exports = {
    getCommunities,
    saveCommunity,
    getOneCommunity,
    editCommunity,
    deleteCommunity,
    filterCommunities,
    getOneCommunityFullData,
    followCommunity,
    unFollowCommunity
}