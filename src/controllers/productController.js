const prisma = require('../utils/prismaClient');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');
const { deleteFile, formatCurrency, formatDate } = require('../utils/helpers');
const path = require('path');

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    if (req.accepts('html')) {
      return res.render('products/index', {
        products,
        currentPage: page,
        totalPages,
        search,
        formatCurrency,
        formatDate,
      });
    }

    return sendSuccess(res, { products, pagination: { page, limit, total, totalPages } });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image,
        categoryId: parseInt(categoryId),
      },
      include: { category: true },
    });

    if (req.accepts('html')) {
      return res.redirect('/products');
    }

    return sendCreated(res, product);
  } catch (error) {
    if (req.file) {
      deleteFile(path.join('uploads', req.file.filename));
    }
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      if (req.file) {
        deleteFile(path.join('uploads', req.file.filename));
      }
      return sendError(res, 'Product not found', 404);
    }

    const updateData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: parseInt(categoryId),
    };

    if (req.file) {
      if (existingProduct.image) {
        deleteFile(path.join('uploads', existingProduct.image));
      }
      updateData.image = req.file.filename;
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { category: true },
    });

    if (req.accepts('html')) {
      return res.redirect('/products');
    }

    return sendSuccess(res, product);
  } catch (error) {
    if (req.file) {
      deleteFile(path.join('uploads', req.file.filename));
    }
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    if (product.image) {
      deleteFile(path.join('uploads', product.image));
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    if (req.accepts('html')) {
      return res.redirect('/products');
    }

    return sendSuccess(res, null, 'Product deleted');
  } catch (error) {
    next(error);
  }
};

const showCreateForm = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    res.render('products/create', { categories });
  } catch (error) {
    next(error);
  }
};

const showEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [product, categories] = await Promise.all([
      prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { category: true },
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    if (!product) {
      return res.status(404).send('Product not found');
    }

    res.render('products/edit', { product, categories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  showCreateForm,
  showEditForm,
};