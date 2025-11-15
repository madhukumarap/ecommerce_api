require('dotenv').config();

const db = require('../models');

// Before ALL tests → create tables
beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

// After ALL tests → close the DB
afterAll(async () => {
  await db.sequelize.close();
});

// Mock Cloudinary (avoid real uploads)
jest.mock('../middleware/cloudinary', () => ({
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: 'https://example.com/test.jpg', //exmaple URL
      public_id: 'test-image'
    }),
    destroy: jest.fn().mockResolvedValue({})
  }
}));
