var express = require('express')
var controller = require('../controllers/revision.server.controller')
var router = express.Router() 

router.get('/', controller.mainPage);
router.get('/revisions', controller.getByTitle);
module.exports = router 