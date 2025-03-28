const {
  getCommunities,
  saveCommunity,
  getOneCommunity,
  editCommunity,
  deleteCommunity,
  filterCommunities,
  getOneCommunityFullData,
  followCommunity,
  unFollowCommunity,
  getMostFollowedCommunities
} = require("../controllers/community.controllers")

const verifyToken = require("../middlewares/verifyToken")

const router = require("express").Router()


router.get('/communities/search/:querySearch', async (req, res, next) => {
  const { querySearch } = req.params

  try {
    const response = await filterCommunities(querySearch)
    console.log(response)
    res.json(response)
  }
  catch (error) {
    next(error)
  }
})


router.post('/communities', verifyToken, saveCommunity)
router.put('/communities/:id', verifyToken, editCommunity)
router.put('/communities/follow/:id', followCommunity)
router.put('/communities/unfollow/:id', unFollowCommunity)
router.delete('/communities/:id', verifyToken, deleteCommunity)
router.get('/communities/', getCommunities)
router.get('/communities/top', getMostFollowedCommunities)
router.get('/communities/:id', getOneCommunity)
router.get('/communities/details/:id', getOneCommunityFullData)

module.exports = router