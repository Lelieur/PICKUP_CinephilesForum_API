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

    fetchMoviesDetails(id) {
        return this.axiosApp.get(`movie/${id}`)
    }


}

module.exports = new tmdbServices()