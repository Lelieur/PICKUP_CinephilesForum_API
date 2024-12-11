const {
  getCommunities,
  saveCommunity,
  getOneCommunity,
  editCommunity,
  deleteCommunity,
  filterCommunities,
  getOneCommunityFullData,
  followCommunity,
  unFollowCommunity
} = require("../controllers/community.controllers")

const verifyToken = require("../middlewares/verifyToken")

const router = require("express").Router()


router.get('/communities/search', filterCommunities)
router.post('/communities/', verifyToken, saveCommunity)
router.put('/communities/:id', verifyToken, editCommunity)
router.put('/communities/follow/:id', followCommunity)
router.put('/communities/unfollow/:id', unFollowCommunity)
router.delete('/communities/:id', verifyToken, deleteCommunity)
router.get('/communities/', getCommunities)
router.get('/communities/:id', getOneCommunity)
router.get('/communities/details/:id', getOneCommunityFullData)

module.exports = router