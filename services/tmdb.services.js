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
        return this.axiosApp.get(`movie/${id}?append_to_response=credits`).select({ original_title: 1, backdrop_path: 1, id: 1, poster_path: 1, release_date: 1 })
    }

    fetchPopularMovies() {
        return this.axiosApp.get('movie/now_playing')
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

    fetchPersonDetails(id) {
        return this.axiosApp.get(`person/${id}`)
    }

    fetchMovieDetails(id) {
        return this.axiosApp.get(`movie/${id}?append_to_response=credits`)
    }

    fetchPersonDetails(id) {
        return this.axiosApp.get(`person/${id}`)
    }

    fetchMovieDetails(id) {
        return this.axiosApp.get(`movie/${id}`)
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


    fetchPopularMovies(page = 1, language = 'en-US,', region = 'US') {
        return this.axiosApp.get(`movie/popular`, {
            params: {
                language: language,
                page: page,
                region: region,
            }
        })
    }


    fetchNowPlayingMovies(page = 1, language = 'en-US', region = 'US') {
        return this.axiosApp.get('movie/now_playing', {
            params: {
                language: language,
                page: page,
                region: region,
            },
        });
    }


    fetchTopRatedMovies(page = 1, language = 'en-US', region = 'US') {
        return this.axiosApp.get('movie/top_rated', {
            params: {
                language: language,
                page: page,
                region: region,
            }
        })
    }


    fetchUpcomingMovies(page = 1, language = 'en-US', region = 'ES') {
        return this.axiosApp.get('movie/upcoming', {
            params: {
                language: language,
                page: page,
                region: region,
            },
        })
    }

    fetchMovieVideos(id) {
        return this.axiosApp.get(`movie/${id}/videos`)
    }
    fetchWatchProviders(id) {
        return this.axiosApp.get(`movie/${id}/watch/providers`)
    }

}

module.exports = new tmdbServices()