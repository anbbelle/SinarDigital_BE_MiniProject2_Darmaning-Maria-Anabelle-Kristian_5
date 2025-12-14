const express = require('express');
const router = express.Router();
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');

router.get('/', (req, res) => {
  res.redirect('/products');
});

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

module.exports = router;