const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { uploadSingle } = require('../middlewares/upload');
const { validateProduct } = require('../middlewares/validator');

router.get('/', productController.getAllProducts);
router.get('/create', productController.showCreateForm);
router.get('/:id/edit', productController.showEditForm);
router.get('/:id', productController.getProductById);
router.post('/', uploadSingle('image'), validateProduct, productController.createProduct);
router.put('/:id', uploadSingle('image'), validateProduct, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;