const { PrismaClient } = require('@prisma/client');
const https = require('https');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Function to download image with better error handling
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    const file = fs.createWriteStream(filepath);

    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlink(filepath, () => {});
        return downloadImage(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(filepath, () => {});
        console.log(`  ✗ Failed (${response.statusCode}): ${filename}`);
        return resolve(null);
      }

      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`  ✓ Downloaded: ${filename}`);
        resolve(filename);
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        console.log(`  ✗ File error: ${filename}`, err.message);
        resolve(null);
      });
    });

    request.on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.log(`  ✗ Request error: ${filename}`, err.message);
      resolve(null);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      fs.unlink(filepath, () => {});
      console.log(`  ✗ Timeout: ${filename}`);
      resolve(null);
    });
  });
}

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const electronics = await prisma.category.create({
    data: { name: 'Electronics', description: 'Electronic devices and gadgets' }
  });

  const fashion = await prisma.category.create({
    data: { name: 'Fashion', description: 'Clothing and accessories' }
  });

  const sports = await prisma.category.create({
    data: { name: 'Sports', description: 'Sports equipment and accessories' }
  });

  const books = await prisma.category.create({
    data: { name: 'Books', description: 'Books and publications' }
  });

  const food = await prisma.category.create({
    data: { name: 'Food & Beverage', description: 'Food and drink products' }
  });

  console.log('✅ Categories created');

  // Products with reliable Unsplash images
  const productsData = [
    {
      name: 'Laptop Gaming ROG',
      description: 'ASUS ROG Strix G15 - High performance gaming laptop with RTX 4060',
      price: 15500000,
      stock: 15,
      categoryId: electronics.id,
      imageUrl: 'https://m.media-amazon.com/images/I/71OyrTkxpGL._AC_UF1000,1000_QL80_.jpg'
    },
    {
      name: 'iPhone 15 Pro Max',
      description: 'Apple iPhone 15 Pro Max 256GB - Titanium Blue',
      price: 22999000,
      stock: 8,
      categoryId: electronics.id,
      imageUrl: 'https://cdnpro.eraspace.com/media/catalog/product/a/p/apple_iphone_15_pro_blue_titanium_1_6_1.jpg'
    },
    {
      name: 'Apple Watch Ultra 2',
      description: 'Apple Watch Ultra 2 - 49mm Titanium Case',
      price: 13499000,
      stock: 5,
      categoryId: electronics.id,
      imageUrl: 'https://cdnpro.eraspace.com/media/catalog/product/a/p/apple_watch_ultra_2_gps_49mm_cellular_natural_titanium_case_with_navy_ocean_band_01.jpg'
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Samsung Galaxy S24 Ultra 512GB - Titanium Gray',
      price: 18999000,
      stock: 12,
      categoryId: electronics.id,
      imageUrl: 'https://images.samsung.com/is/image/samsung/assets/id/smartphones/galaxy-s24-ultra/buy/S24Ultra-Color-Titanium_Black_MO_0527_final.jpg?imbypass=true'
    },
    {
      name: 'MacBook Pro M3',
      description: 'MacBook Pro 14" M3 Pro Chip 18GB RAM 512GB SSD',
      price: 32999000,
      stock: 6,
      categoryId: electronics.id,
      imageUrl: 'https://macstore.id/wp-content/uploads/2023/12/mbp14-m3-max-pro-spaceblack-gallery2-202310.jpeg'
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Black',
      price: 5499000,
      stock: 18,
      categoryId: electronics.id,
      imageUrl: 'https://www.sony.co.id/image/6145c1d32e6ac8e63a46c912dc33c5bb?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF'
    },
    {
      name: 'Canon EOS R6',
      description: 'Canon EOS R6 Mirrorless Camera Body',
      price: 38999000,
      stock: 4,
      categoryId: electronics.id,
      imageUrl: 'https://megakamera.com/wp-content/uploads/2021/05/Canon-EOS-R6-Mirrorless-Digital-Camera-with-24-105mm-USM-Lens-1.jpg'
    },
    {
      name: 'Nike Air Jordan 1',
      description: 'Nike Air Jordan 1 Retro High OG - Chicago',
      price: 2499000,
      stock: 25,
      categoryId: sports.id,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRydHrumZsqL0zFD5-PMonb2ShHv5vM81eI3A&s'
    },
    {
      name: 'Adidas Ultraboost',
      description: 'Adidas Ultraboost Light Running Shoes',
      price: 2799000,
      stock: 30,
      categoryId: sports.id,
      imageUrl: 'https://img.ncrsport.com/img/storage/large/HQ6351-1.jpg'
    },
    {
      name: 'Wilson Basketball',
      description: 'Wilson Evolution Indoor Basketball - Official Size 7',
      price: 450000,
      stock: 50,
      categoryId: sports.id,
      imageUrl: 'https://images-cdn.ubuy.co.id/65393efb5ea93251955a69aa-wilson-evolution-official-game.jpg'
    },
    {
      name: 'Zara Denim Jacket',
      description: 'Zara Classic Denim Jacket - Blue Wash',
      price: 899000,
      stock: 20,
      categoryId: fashion.id,
      imageUrl: 'https://static.zara.net/assets/public/4c59/e84a/e4b049c380dc/a6a6eac68e91/04441820400-e1/04441820400-e1.jpg?ts=1756280882138'
    },
    {
      name: 'H&M Cotton T-Shirt',
      description: 'H&M Regular Fit Cotton T-Shirt - White',
      price: 199000,
      stock: 100,
      categoryId: fashion.id,
      imageUrl: 'https://d29c1z66frfv6c.cloudfront.net/pub/media/catalog/product/zoom/a0fbc372810d491c3e785d5f60433d368d7e47e7_xxl-1.jpg'
    },
    {
      name: 'Filosofi Teras',
      description: 'Buku Filosofi Teras - Henry Manampiring',
      price: 98000,
      stock: 40,
      categoryId: books.id,
      imageUrl: 'https://klasika.kompas.id/wp-content/uploads/2022/09/Filosofi-Teras.jpg'
    },
    {
      name: 'Cantik Itu Luka',
      description: 'Novel Cantik Itu Luka - Eka Kurniawan',
      price: 115000,
      stock: 35,
      categoryId: books.id,
      imageUrl: 'https://image.gramedia.net/rs:fit:0:0/plain/https://cdn.gramedia.com/uploads/items/9786020366517_Cantik-Itu-Luka-Hard-Cover---Limited-Edition.jpg'
    },
    {
      name: 'Starbucks Coffee Beans',
      description: 'Starbucks Pike Place Roast Whole Bean Coffee 250g',
      price: 185000,
      stock: 60,
      categoryId: food.id,
      imageUrl: 'https://m.media-amazon.com/images/I/81BHLjy54BL._SL1500_.jpg'
    },
    {
      name: 'iPad Pro M2',
      description: 'iPad Pro 11" M2 Chip WiFi 128GB - Space Gray',
      price: 16999000,
      stock: 10,
      categoryId: electronics.id,
      imageUrl: 'https://macstore.id/wp-content/uploads/2024/01/ipad-pro-finish-select-202212-12-9inch-silver-wifi.jpeg'
    },
    {
      name: 'AirPods Pro 2',
      description: 'Apple AirPods Pro (2nd Generation) with MagSafe Case',
      price: 3799000,
      stock: 22,
      categoryId: electronics.id,
      imageUrl: 'https://macstore.id/wp-content/uploads/2022/10/MQD83.jpeg'
    },
    {
      name: 'Puma RS-X',
      description: 'Puma RS-X Reinvention Sneakers',
      price: 1899000,
      stock: 35,
      categoryId: sports.id,
      imageUrl: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/403268/02/sv01/fnd/IDN/fmt/png/Sepatu-Sneaker-RS-X-Efekt-Leo-Unisex'
    },
    {
      name: 'Uniqlo Hoodie',
      description: 'Uniqlo Sweat Pullover Hoodie - Navy',
      price: 399000,
      stock: 80,
      categoryId: fashion.id,
      imageUrl: 'https://image.uniqlo.com/UQ/ST3/id/imagesgoods/475378/item/idgoods_68_475378_3x4.jpg?width=600'
    },
    {
      name: 'Laut Bercerita',
      description: 'Novel Laut Bercerita - Leila S. Chudori',
      price: 105000,
      stock: 45,
      categoryId: books.id,
      imageUrl: 'https://cdn.mediajabar.com/2023/08/Resensi-Novel-Laut-Bercerita-Karya-Leila-S.-Chudori.webp'
    }
  ];

  console.log('📥 Downloading product images...');
  console.log('⏳ This may take a while...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < productsData.length; i++) {
    const productData = productsData[i];
    const filename = `product-${i + 1}.jpg`;
    
    console.log(`[${i + 1}/${productsData.length}] ${productData.name}`);
    const savedFilename = await downloadImage(productData.imageUrl, filename);
    
    if (savedFilename) {
      successCount++;
    } else {
      failCount++;
    }
    
    await prisma.product.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        categoryId: productData.categoryId,
        image: savedFilename || 'placeholder.jpg' // Use placeholder if download fails
      }
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Seeding completed!');
  console.log(`📦 Created ${productsData.length} products in 5 categories`);
  console.log(`✓ ${successCount} images downloaded successfully`);
  if (failCount > 0) {
    console.log(`✗ ${failCount} images failed (using placeholder)`);
  }
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });