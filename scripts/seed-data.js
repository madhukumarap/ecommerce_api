const db = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('Seeding initial data...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await db.User.create({
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customerUser = await db.User.create({
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer'
    });

    // Create carts for users
    await db.Cart.create({ userId: adminUser.id });
    await db.Cart.create({ userId: customerUser.id });

    // Create categories
    const categories = await db.Category.bulkCreate([
      {
        name: 'Electronics',
        description: 'Latest electronic gadgets and devices'
      },
      {
        name: 'Clothing',
        description: 'Fashionable clothing for all seasons'
      },
      {
        name: 'Books',
        description: 'Educational and entertaining books'
      },
      {
        name: 'Home & Kitchen',
        description: 'Home appliances and kitchen tools'
      }
    ]);

    // Create sample products
    const products = await db.Product.bulkCreate([
      {
        name: 'iPhone 14 Pro',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        stock: 50,
        categoryId: categories[0].id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1633456789/iphone14.jpg'
      },
      {
        name: 'Samsung Galaxy S23',
        description: 'Powerful Android smartphone',
        price: 849.99,
        stock: 75,
        categoryId: categories[0].id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1633456789/galaxy-s23.jpg'
      },
      {
        name: 'MacBook Pro',
        description: 'High-performance laptop for professionals',
        price: 1999.99,
        stock: 25,
        categoryId: categories[0].id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1633456789/macbook-pro.jpg'
      },
      {
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton t-shirt for everyday wear',
        price: 19.99,
        stock: 100,
        categoryId: categories[1].id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1633456789/tshirt.jpg'
      },
      {
        name: 'JavaScript: The Good Parts',
        description: 'Essential JavaScript programming book',
        price: 29.99,
        stock: 30,
        categoryId: categories[2].id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1633456789/javascript-book.jpg'
      },
      {
        name: 'Coffee Maker',
        description: 'Automatic drip coffee maker',
        price: 79.99,
        stock: 40,
        categoryId: categories[3].id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1633456789/coffee-maker.jpg'
      }
    ]);

    console.log(' Seed data created successfully:');
    console.log(`   - ${await db.User.count()} users`);
    console.log(`   - ${await db.Category.count()} categories`);
    console.log(`   - ${await db.Product.count()} products`);

  } catch (error) {
    console.error(' Error seeding data:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedData;