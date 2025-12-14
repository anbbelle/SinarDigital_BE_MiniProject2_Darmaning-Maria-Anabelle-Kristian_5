const { sendError } = require('../utils/response');

const validateProduct = (req, res, next) => {
  const { name, price, stock, categoryId } = req.body;
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    errors.price = 'Valid price is required';
  }

  if (stock === undefined || isNaN(stock) || parseInt(stock) < 0) {
    errors.stock = 'Valid stock is required';
  }

  if (!categoryId || isNaN(categoryId)) {
    errors.categoryId = 'Valid category is required';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

const validateCategory = (req, res, next) => {
  const { name } = req.body;
  const errors = {};

  if (!name || name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

module.exports = { validateProduct, validateCategory };