const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');

router.get('/my-goals', auth, goalController.getMyGoals);
router.post('/', auth, goalController.createGoal); // HR
router.put('/:id/progress', auth, goalController.updateGoalProgress);

module.exports = router;
