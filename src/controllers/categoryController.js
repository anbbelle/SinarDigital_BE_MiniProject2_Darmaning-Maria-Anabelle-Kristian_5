const prisma = require('../utils/prismaClient');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');
const { formatDate } = require('../utils/helpers');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    if (req.accepts('html')) {
      return res.render('categories/index', { categories, formatDate });
    }

    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const category = await prisma.category.create({
      data: { name, description },
    });

    if (req.accepts('html')) {
      return res.redirect('/categories');
    }

    return sendCreated(res, category);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, description },
    });

    if (req.accepts('html')) {
      return res.redirect('/categories');
    }

    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return sendError(res, 'Category not found', 404);
    }

    if (category._count.products > 0) {
      return sendError(res, `Cannot delete. Has ${category._count.products} products`, 400);
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    if (req.accepts('html')) {
      return res.redirect('/categories');
    }

    return sendSuccess(res, null, 'Category deleted');
  } catch (error) {
    next(error);
  }
};

const showCreateForm = (req, res) => {
  res.render('categories/create');
};

const showEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category) {
      return res.status(404).send('Category not found');
    }

    res.render('categories/edit', { category });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  showCreateForm,
  showEditForm,
};