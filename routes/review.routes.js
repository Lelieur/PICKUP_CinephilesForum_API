const {
  getReviews,
  getReviewsFromMovie,
  saveReview,
  getOneReview,
  editReview,
  deleteReview,
  filterReviews,
  getReviewsFromAuthor,
  getMostLikedReviews,
  likeReview,
  getOneReviewFullData
} = require("../controllers/review.controllers")


const verifyToken = require("../middlewares/verifyToken")

const router = require("express").Router()


router.get('/reviews/search', filterReviews)
router.post('/reviews', verifyToken, saveReview)
router.put('/reviews/:id', verifyToken, editReview)
router.get('/reviews/movies/:movieId', getReviewsFromMovie)
router.get('/reviews/users/:authorId', getReviewsFromAuthor)
router.get('/reviews/top', getMostLikedReviews)
router.delete('/reviews/:id', verifyToken, deleteReview)
router.get('/reviews', getReviews)
router.get('/reviews/:id', getOneReview)
router.patch('/:id/like', likeReview)
router.get('/reviews/details/:id', getOneReviewFullData)

module.exports = router