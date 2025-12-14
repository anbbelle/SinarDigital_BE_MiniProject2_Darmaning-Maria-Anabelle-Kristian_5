const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { validateCategory } = require('../middlewares/validator');

router.get('/', categoryController.getAllCategories);
router.get('/create', categoryController.showCreateForm);
router.get('/:id/edit', categoryController.showEditForm);
router.get('/:id', categoryController.getCategoryById);
router.post('/', validateCategory, categoryController.createCategory);
router.put('/:id', validateCategory, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;