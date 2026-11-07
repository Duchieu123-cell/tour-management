const router = require('express').Router();
const profileController = require('../../controllers/client/profile.controller');

router.delete('/delete', profileController.deleteAccount);
router.patch('/delete', profileController.deleteAccount);
router.post('/delete', profileController.deleteAccount);
router.delete('/', profileController.deleteAccount);

module.exports = router;
