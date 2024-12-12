const tmdbServices = require('./../services/tmdb.services')

const router = require("express").Router()

router.get('/movies/popular', tmdbServices.fetchPopularMovies)
router.get('/person/:id', tmdbServices.fetchPersonDetails)


router.get('/movies/:id', async (req, res, next) => {
    const { id } = req.params
    try {
        const response = await tmdbServices.fetchMovieDetails(id)
        res.json(response.data)
    } catch (error) {
        next(error)
    }
})

router.get('/movies/search/:querySearch', async (req, res, next) => {
    const { querySearch } = req.params
    try {
        const response = await tmdbServices.fetchMovieFilter(querySearch)
        res.json(response.data)
    } catch (error) {
        next(error)
    }
})

router.get('/persons/search/:querySearch', async (req, res, next) => {
    const { querySearch } = req.params
    try {
        const response = await tmdbServices.fetchPersonFilter(querySearch)
        res.json(response.data)
    } catch (error) {
        next(error)
    }
})


router.get('/persons/directors/search/:querySearch', async (req, res, next) => {
    const { querySearch } = req.params
    try {
        const response = await tmdbServices.fetchPersonFilter(querySearch)
        const allResults = response.data.results
        let directors = allResults.filter(person => person.known_for_department === 'Directing')
        res.json(directors)
    } catch (error) {
        next(error)
    }
})


router.get('/persons/actors/search/:querySearch', async (req, res, next) => {
    const { querySearch } = req.params
    try {
        const response = await tmdbServices.fetchPersonFilter(querySearch)
        const allResults = response.data.results
        let actors = allResults.filter(person => person.known_for_department === 'Acting')
        res.json(actors)
    } catch (error) {
        next(error)
    }
})


router.get('/movies/popular', async (req, res, next) => {
    try {
        const { page = 1 } = req.query;
        const response = await tmdbServices.fetchPopularMovies(page);
        res.json(response.data);
    } catch (error) {
        next(error);
    }
});


router.get('/movies/top-rated', async (req, res, next) => {
    try {
        const { page = 1 } = req.query;
        const response = await tmdbServices.fetchTopRatedMovies(page);
        res.json(response.data);
    } catch (error) {
        next(error);
    }
});


router.get('/movies/now-playing', async (req, res, next) => {
    try {
        const { page = 1 } = req.query;
        const response = await tmdbServices.fetchNowPlayingMovies(page);
        res.json(response.data);
    } catch (error) {
        next(error);
    }
});


router.get('/movies/upcoming', async (req, res, next) => {
    try {
        const { page = 1 } = req.query;
        const response = await tmdbServices.fetchUpcomingMovies(page);
        res.json(response.data);
    } catch (error) {
        next(error);
    }
});












module.exports = router