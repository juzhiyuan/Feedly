const router = require('koa-router')()

const feed = require('./controller/feed')

router.get('/list', feed.getList)

module.exports = router
