require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const multer = require('multer');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// FIX: Serve static files with absolute path
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Setup EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper function for currency format
app.locals.formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// ==================== ROUTES ====================

// Homepage
app.get('/', (req, res) => {
  res.render('index');
});

// ========== CATEGORIES ROUTES ==========

// Show create category form (BEFORE /:id routes)
app.get('/categories/create', (req, res) => {
  res.render('categories/create');
});

// List categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.render('categories/index', { categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading categories');
  }
});

// Create category
app.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    await prisma.category.create({
      data: { name, description }
    });
    res.redirect('/categories');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating category');
  }
});

// Show edit category form
app.get('/categories/:id/edit', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!category) return res.status(404).send('Category not found');
    res.render('categories/edit', { category });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading category');
  }
});

// Update category
app.put('/categories/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description }
    });
    res.redirect('/categories');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating category');
  }
});

// Delete category
app.delete('/categories/:id', async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.redirect('/categories');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting category');
  }
});

// ========== PRODUCTS ROUTES ==========

// IMPORTANT: Specific routes BEFORE parameterized routes!

// Show create product form (MUST BE BEFORE /:id routes)
app.get('/products/create', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.render('products/create', { categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading form');
  }
});

// List products with search and pagination
app.get('/products', async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    const perPage = 9;
    const skip = (parseInt(page) - 1) * perPage;

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage
      }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(total / perPage);

    res.render('products/index', {
      products,
      search: search || '',
      currentPage: parseInt(page),
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading products');
  }
});

// Create product
app.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    
    await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: parseInt(categoryId),
        image: req.file ? req.file.filename : null
      }
    });
    
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating product');
  }
});

// Show edit product form
app.get('/products/:id/edit', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    if (!product) return res.status(404).send('Product not found');
    
    res.render('products/edit', { product, categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading product');
  }
});

// Update product
app.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const productId = parseInt(req.params.id);
    
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: parseInt(categoryId)
    };
    
    if (req.file) {
      updateData.image = req.file.filename;
      
      if (existingProduct && existingProduct.image) {
        const oldImagePath = path.join(uploadsDir, existingProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    await prisma.product.update({
      where: { id: productId },
      data: updateData
    });
    
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating product');
  }
});

// Delete product
app.delete('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (product && product.image) {
      const imagePath = path.join(uploadsDir, product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await prisma.product.delete({
      where: { id: productId }
    });
    
    res.redirect('/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting product');
  }
});

// ========== API ENDPOINTS ==========

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving uploads from: ${uploadsDir}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});