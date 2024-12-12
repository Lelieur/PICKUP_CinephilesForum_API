const axios = require('axios')

const TMDB_API_BASE_URL = process.env.TMDB_API_BASE_URL
const TMDB_API_TOKEN = process.env.TMDB_API_TOKEN

class tmdbServices {

    constructor() {
        this.axiosApp = axios.create({
            baseURL: TMDB_API_BASE_URL
        })

        this.axiosApp.interceptors.request.use(config => {
            config.headers = { Authorization: `Bearer ${TMDB_API_TOKEN}` }
            return config
        })
    }


    fetchPersonDetails(id) {
        return this.axiosApp.get(`person/${id}`)
    }

    fetchMovieDetails(id) {
        return this.axiosApp.get(`movie/${id}`)
    }

    fetchPopularMovies() {
        return this.axiosApp.get('movie/now_playing')
    }

    fetchTopRatedMovies(page = 1) {
        return this.axiosApp.get(`movie/top_rated`, { params: { page } });
    }


    fetchNowPlayingMovies(page = 1) {
        return this.axiosApp.get(`movie/now_playing`, { params: { page } });
    }


    fetchUpcomingMovies(page = 1) {
        return this.axiosApp.get(`movie/upcoming`, { params: { page } });
    }

    fetchMovieFilter(querySearch, cancelToken) {
        return this.axiosApp.get(`search/movie?query=${encodeURIComponent(querySearch)}`, {
            cancelToken
        })
    }

    fetchPersonFilter(querySearch) {
        const querySearchAdapted = querySearch.replace(/ /g, "%20")
        return this.axiosApp.get(`search/person?query=${encodeURIComponent(querySearchAdapted)}&include_adult=false&language=en-US&page=1`)
    }

    fetchUpcomingMovies(page = 1) {
        return this.axiosApp.get(`movie/upcoming?page=${page}`)
    }
}

module.exports = new tmdbServices()