const axios = require('axios')

const mongoose = require('mongoose')
const Community = require('./../models/Community.model')

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

            const { moviesApiIds, users, fetishActors, fetishDirectors } = community

            const moviesPromises = moviesApiIds.map(elm => tmdbServices.fetchMoviesDetails(elm))
            const actorsPromises = fetishActors.map(elm => tmdbServices.fetchPersonDetails(elm))
            const directorsPromises = fetishDirectors.map(elm => tmdbServices.fetchPersonDetails(elm))

            const usersPromises = users.map(elm => axios.get(`http://localhost:5005/api/users/${elm}`))

            return Promise.all
                ([
                    Promise.all(moviesPromises),
                    Promise.all(usersPromises),
                    Promise.all(actorsPromises),
                    Promise.all(directorsPromises)
                ])

        })
        .then(([movies, users, actors, directos]) => {

            const moviesData = movies.map(elm => {
                const { original_title, backdrop_path } = elm.data

                const directorData = {
                    original_title: original_title,
                    backdrop_path: backdrop_path
                }

                return directorData
            })

            const usersData = users.map(elm => elm.data)

            const actorsData = actors.map(elm => {
                const { name, profile_path } = elm.data

                const actorData = {
                    name: name,
                    profile_path: profile_path
                }

                return actorData
            })

            const directorsData = directos.map(elm => {

                const { name, profile_path } = elm.data

                const directorData = {
                    name: name,
                    profile_path: profile_path
                }

                return directorData
            })

            const { title, description, cover, genres, decades, owner } = originalCommunity

            const newCommunity = {
                title: title,
                description: description,
                cover: cover,
                genres: genres,
                fetishDirectors: directorsData,
                fetishActors: actorsData,
                decades: decades,
                moviesApiIds: moviesData,
                users: usersData,
                owner: owner
            }

            res.json(newCommunity)

        })
        .catch(err => next(err))
}

const saveCommunity = (req, res, next) => {

    const { title, description, cover, genres, fetishDirectors, fetishActors, decades, moviesApiIds, users } = req.body
    const { _id: owner } = req.payload

    Community
        .create({ title, description, cover, genres, fetishDirectors, fetishActors, decades, moviesApiIds, users, owner })
        .then(community => res.status(201).json(community))
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
        .findByIdAndDelete(communityId)
        .then(() => res.sendStatus(200))
        .catch(err => next(err))
}

const filterCommunities = async (req, res, next) => {

    const { query } = req.query

    if (!query) {
        return res.status(400).json({ message: "Introduce un término de búsqueda" });
    }

    const querySearch = {
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { genres: { $regex: query, $options: 'i' } },
            { fetishDirectors: { $regex: query, $options: 'i' } },
            { fetishActors: { $regex: query, $options: 'i' } },
            { decades: parseInt(query) || undefined },
            { moviesApiIds: query }
        ]
    }

    Community
        .find(querySearch)
        .then(communities => res.json(communities))
        .catch(err => next(err))
}


module.exports = {
    getCommunities,
    saveCommunity,
    getOneCommunity,
    editCommunity,
    deleteCommunity,
    filterCommunities,
    getOneCommunityFullData
}