const axios = require('axios')

const getCreditDetails = (req, res, next) => {

    const { id: credit_id } = req.params
    const url = `https://api.themoviedb.org/3/person/${credit_id}`

    axios
        .get(url, { headers: { Authorization: `Bearer ${process.env.TMDB_API_TOKEN}` } })
        .then(response => {
            res.json(response.data)
        })
        .catch(err => next(err))
}

const findCredit = (req, res, next) => {

    const { querySearch } = req.params

    const querySearchAdapted = querySearch.replace(/ /g, "%20");

    const url = `https://api.themoviedb.org/3/search/person?query=${querySearchAdapted}&include_adult=false&language=en-US&page=1`

    axios
        .get(url, { headers: { Authorization: `Bearer ${process.env.TMDB_API_TOKEN}` } })
        .then(response => {
            res.json(response.data)
        })
        .catch(err => next(err))
}

module.exports = {
    getCreditDetails,
    findCredit
}