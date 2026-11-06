const router = require('express').Router();
const searchController = require('../../controllers/client/search.controller');
const aiSearchController = require('../../controllers/client/ai-search.controller');
const searchValidate = require('../../validates/client/search.validate');

router.get('/', searchController.list);
router.post('/ai', searchValidate.aiSearchPost, aiSearchController.searchPost);

module.exports = router;