const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'A comprehensive E-commerce REST API with authentication, product management, and order processing',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'customer'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' }
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'price', 'stock', 'categoryId'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'float' },
            stock: { type: 'integer' },
            imageUrl: { type: 'string' },
            categoryId: { type: 'string', format: 'uuid' },
            category: { $ref: '#/components/schemas/Category' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/CartItem' }
            },
            totalAmount: { type: 'number', format: 'float' }
          }
        },
        CartItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            cartId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer' },
            priceAtAddition: { type: 'number', format: 'float' },
            product: { $ref: '#/components/schemas/Product' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            totalAmount: { type: 'number', format: 'float' },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] 
            },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            orderId: { type: 'string', format: 'uuid' },
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer' },
            priceAtOrder: { type: 'number', format: 'float' },
            productName: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'string' }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  msg: { type: 'string' },
                  path: { type: 'string' },
                  location: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer' },
            totalPages: { type: 'integer' },
            totalProducts: { type: 'integer' },
            totalOrders: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Invalid token',
                message: 'Access denied'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Access denied',
                message: 'Insufficient permissions'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                error: 'Not found',
                message: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(options);

// Add paths directly to specs for comprehensive documentation
specs.paths = {
  '/health': {
    get: {
      summary: 'Health check',
      description: 'Check if the API server is running',
      tags: ['Health'],
      responses: {
        200: {
          description: 'Server is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  timestamp: { type: 'string', format: 'date-time' },
                  message: { type: 'string', example: 'Server is running correctly' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/register': {
    post: {
      summary: 'Register a new user',
      description: 'Create a new user account with customer or admin role',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'firstName', 'lastName'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'customer@example.com'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  minLength: 6,
                  example: 'password123'
                },
                firstName: {
                  type: 'string',
                  example: 'John'
                },
                lastName: {
                  type: 'string',
                  example: 'Doe'
                },
                role: {
                  type: 'string',
                  enum: ['admin', 'customer'],
                  default: 'customer',
                  example: 'customer'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'User registered successfully'
                  },
                  token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  },
                  user: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error or user already exists',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/ValidationError' },
                  { $ref: '#/components/schemas/Error' }
                ]
              },
              examples: {
                validationError: {
                  value: {
                    errors: [
                      {
                        type: 'field',
                        msg: 'Invalid value',
                        path: 'email',
                        location: 'body'
                      }
                    ]
                  }
                },
                userExists: {
                  value: {
                    error: 'User already exists with this email'
                  }
                }
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/auth/login': {
    post: {
      summary: 'Login user',
      description: 'Authenticate user and return JWT token',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'customer@example.com'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'password123'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Login successful'
                  },
                  token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  },
                  user: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Invalid credentials'
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/categories': {
    get: {
      summary: 'Get all categories',
      description: 'Retrieve all categories with their products',
      tags: ['Categories'],
      responses: {
        200: {
          description: 'Categories retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Categories retrieved successfully'
                  },
                  count: {
                    type: 'integer',
                    example: 2
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Category'
                    }
                  }
                }
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    },
    post: {
      summary: 'Create a new category',
      description: 'Create a new product category (Admin only)',
      tags: ['Categories'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: {
                  type: 'string',
                  example: 'Electronics'
                },
                description: {
                  type: 'string',
                  example: 'Electronic devices and gadgets'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Category created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Category created successfully'
                  },
                  category: {
                    $ref: '#/components/schemas/Category'
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: '#/components/responses/ValidationError'
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        403: {
          $ref: '#/components/responses/ForbiddenError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/categories/{id}': {
    get: {
      summary: 'Get category by ID',
      description: 'Retrieve a specific category by its ID with associated products',
      tags: ['Categories'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Category ID'
        }
      ],
      responses: {
        200: {
          description: 'Category retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Category retrieved successfully'
                  },
                  data: {
                    $ref: '#/components/schemas/Category'
                  }
                }
              }
            }
          }
        },
        404: {
          $ref: '#/components/responses/NotFoundError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    },
    put: {
      summary: 'Update a category',
      description: 'Update an existing category (Admin only)',
      tags: ['Categories'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Category ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Updated Electronics'
                },
                description: {
                  type: 'string',
                  example: 'Updated description for electronics'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Category updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Category updated successfully'
                  },
                  category: {
                    $ref: '#/components/schemas/Category'
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: '#/components/responses/ValidationError'
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        403: {
          $ref: '#/components/responses/ForbiddenError'
        },
        404: {
          $ref: '#/components/responses/NotFoundError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    },
    delete: {
      summary: 'Delete a category',
      description: 'Delete a category (Admin only). Cannot delete if category has associated products.',
      tags: ['Categories'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Category ID'
        }
      ],
      responses: {
        200: {
          description: 'Category deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Category deleted successfully'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Cannot delete category with associated products',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Cannot delete category with associated products'
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        403: {
          $ref: '#/components/responses/ForbiddenError'
        },
        404: {
          $ref: '#/components/responses/NotFoundError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/products': {
    get: {
      summary: 'Get all products',
      description: 'Retrieve products with filtering, searching, and pagination',
      tags: ['Products'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number'
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Number of products per page'
        },
        {
          name: 'category',
          in: 'query',
          schema: {
            type: 'string'
          },
          description: 'Filter by category name'
        },
        {
          name: 'minPrice',
          in: 'query',
          schema: {
            type: 'number',
            format: 'float'
          },
          description: 'Minimum price filter'
        },
        {
          name: 'maxPrice',
          in: 'query',
          schema: {
            type: 'number',
            format: 'float'
          },
          description: 'Maximum price filter'
        },
        {
          name: 'search',
          in: 'query',
          schema: {
            type: 'string'
          },
          description: 'Search products by name'
        }
      ],
      responses: {
        200: {
          description: 'Products retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  products: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Product'
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/Pagination'
                  }
                }
              },
              example: {
                products: [
                  {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'iPhone 14 Pro',
                    description: 'Latest Apple smartphone',
                    price: 999.99,
                    stock: 50,
                    imageUrl: 'https://example.com/iphone.jpg',
                    categoryId: '123e4567-e89b-12d3-a456-426614174001',
                    createdAt: '2023-10-01T12:00:00.000Z',
                    updatedAt: '2023-10-01T12:00:00.000Z'
                  }
                ],
                pagination: {
                  currentPage: 1,
                  totalPages: 5,
                  totalProducts: 50,
                  hasNext: true,
                  hasPrev: false
                }
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    },
    post: {
      summary: 'Create a new product',
      description: 'Create a new product with optional image upload (Admin only)',
      tags: ['Products'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['name', 'price', 'stock', 'categoryId'],
              properties: {
                name: {
                  type: 'string',
                  example: 'iPhone 14 Pro'
                },
                description: {
                  type: 'string',
                  example: 'Latest Apple smartphone with advanced features'
                },
                price: {
                  type: 'number',
                  format: 'float',
                  example: 999.99
                },
                stock: {
                  type: 'integer',
                  example: 50
                },
                categoryId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174001'
                },
                image: {
                  type: 'string',
                  format: 'binary',
                  description: 'Product image file'
                }
              }
            }
          },
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'price', 'stock', 'categoryId'],
              properties: {
                name: {
                  type: 'string',
                  example: 'iPhone 14 Pro'
                },
                description: {
                  type: 'string',
                  example: 'Latest Apple smartphone with advanced features'
                },
                price: {
                  type: 'number',
                  format: 'float',
                  example: 999.99
                },
                stock: {
                  type: 'integer',
                  example: 50
                },
                categoryId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174001'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Product created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product created successfully'
                  },
                  product: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: '#/components/responses/ValidationError'
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        403: {
          $ref: '#/components/responses/ForbiddenError'
        },
        404: {
          description: 'Category not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Category not found'
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/products/{id}': {
    get: {
      summary: 'Get product by ID',
      description: 'Retrieve a specific product by its ID with category details',
      tags: ['Products'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Product ID'
        }
      ],
      responses: {
        200: {
          description: 'Product retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  product: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
          }
        },
        404: {
          $ref: '#/components/responses/NotFoundError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    },
    put: {
      summary: 'Update a product',
      description: 'Update an existing product (Admin only)',
      tags: ['Products'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Product ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'iPhone 14 Pro Max'
                },
                description: {
                  type: 'string',
                  example: 'Updated description'
                },
                price: {
                  type: 'number',
                  format: 'float',
                  example: 1099.99
                },
                stock: {
                  type: 'integer',
                  example: 40
                },
                categoryId: {
                  type: 'string',
                  format: 'uuid'
                },
                image: {
                  type: 'string',
                  format: 'binary',
                  description: 'New product image (optional)'
                }
              }
            }
          },
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'iPhone 14 Pro Max'
                },
                description: {
                  type: 'string',
                  example: 'Updated description'
                },
                price: {
                  type: 'number',
                  format: 'float',
                  example: 1099.99
                },
                stock: {
                  type: 'integer',
                  example: 40
                },
                categoryId: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Product updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product updated successfully'
                  },
                  product: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
          }
        },
        400: {
          $ref: '#/components/responses/ValidationError'
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        403: {
          $ref: '#/components/responses/ForbiddenError'
        },
        404: {
          $ref: '#/components/responses/NotFoundError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    },
    delete: {
      summary: 'Delete a product',
      description: 'Delete a product (Admin only)',
      tags: ['Products'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Product ID'
        }
      ],
      responses: {
        200: {
          description: 'Product deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product deleted successfully'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        403: {
          $ref: '#/components/responses/ForbiddenError'
        },
        404: {
          $ref: '#/components/responses/NotFoundError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/cart': {
    get: {
      summary: 'Get user cart',
      description: 'Retrieve the current user shopping cart with items',
      tags: ['Cart'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Cart retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cart: {
                    $ref: '#/components/schemas/Cart'
                  }
                }
              },
              example: {
                cart: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  userId: '123e4567-e89b-12d3-a456-426614174001',
                  totalAmount: 1999.98,
                  items: [
                    {
                      id: '123e4567-e89b-12d3-a456-426614174002',
                      productId: '123e4567-e89b-12d3-a456-426614174003',
                      quantity: 2,
                      priceAtAddition: 999.99,
                      product: {
                        id: '123e4567-e89b-12d3-a456-426614174003',
                        name: 'iPhone 14 Pro',
                        imageUrl: 'https://example.com/iphone.jpg',
                        stock: 50
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        404: {
          description: 'Cart not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Cart not found'
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/cart/add': {
    post: {
      summary: 'Add item to cart',
      description: 'Add a product to the user shopping cart',
      tags: ['Cart'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000'
                },
                quantity: {
                  type: 'integer',
                  minimum: 1,
                  example: 2
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Product added to cart successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product added to cart successfully'
                  },
                  cart: {
                    $ref: '#/components/schemas/Cart'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error or insufficient stock',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              examples: {
                validationError: {
                  value: {
                    errors: [
                      {
                        type: 'field',
                        msg: 'Invalid value',
                        path: 'productId',
                        location: 'body'
                      }
                    ]
                  }
                },
                insufficientStock: {
                  value: {
                    error: 'Insufficient stock available'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        404: {
          description: 'Product or cart not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/cart/item/{itemId}': {
    put: {
      summary: 'Update cart item quantity',
      description: 'Update the quantity of a specific item in the cart',
      tags: ['Cart'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'itemId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Cart item ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['quantity'],
              properties: {
                quantity: {
                  type: 'integer',
                  minimum: 1,
                  example: 3
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Cart item updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Cart item updated successfully'
                  },
                  cartItem: {
                    $ref: '#/components/schemas/CartItem'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Validation error or insufficient stock',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        404: {
          description: 'Cart item not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    },
    delete: {
      summary: 'Remove item from cart',
      description: 'Remove a specific item from the shopping cart',
      tags: ['Cart'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'itemId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Cart item ID'
        }
      ],
      responses: {
        200: {
          description: 'Item removed from cart successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Item removed from cart successfully'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        404: {
          description: 'Cart item not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/cart/clear': {
    delete: {
      summary: 'Clear cart',
      description: 'Remove all items from the shopping cart',
      tags: ['Cart'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Cart cleared successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Cart cleared successfully'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        404: {
          description: 'Cart not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/orders': {
    get: {
      summary: 'Get user orders',
      description: 'Retrieve all orders for the current user with pagination',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number'
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 10
          },
          description: 'Number of orders per page'
        }
      ],
      responses: {
        200: {
          description: 'Orders retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orders: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Order'
                    }
                  },
                  pagination: {
                    $ref: '#/components/schemas/Pagination'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    },
    post: {
      summary: 'Create order',
      description: 'Create a new order from the current user cart',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      responses: {
        201: {
          description: 'Order created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Order created successfully'
                  },
                  order: {
                    $ref: '#/components/schemas/Order'
                  }
                }
              },
              example: {
                message: 'Order created successfully',
                order: {
                  id: '123e4567-e89b-12d3-a456-426614174000',
                  userId: '123e4567-e89b-12d3-a456-426614174001',
                  totalAmount: 1999.98,
                  status: 'pending',
                  items: [
                    {
                      id: '123e4567-e89b-12d3-a456-426614174002',
                      productId: '123e4567-e89b-12d3-a456-426614174003',
                      quantity: 2,
                      priceAtOrder: 999.99,
                      productName: 'iPhone 14 Pro'
                    }
                  ],
                  createdAt: '2023-10-01T12:00:00.000Z',
                  updatedAt: '2023-10-01T12:00:00.000Z'
                }
              }
            }
          }
        },
        400: {
          description: 'Cart is empty or insufficient stock',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              examples: {
                emptyCart: {
                  value: {
                    error: 'Cart is empty'
                  }
                },
                insufficientStock: {
                  value: {
                    error: 'Insufficient stock for iPhone 14 Pro'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  },
  '/api/orders/{id}': {
    get: {
      summary: 'Get order by ID',
      description: 'Retrieve a specific order by its ID',
      tags: ['Orders'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Order ID'
        }
      ],
      responses: {
        200: {
          description: 'Order retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  order: {
                    $ref: '#/components/schemas/Order'
                  }
                }
              }
            }
          }
        },
        401: {
          $ref: '#/components/responses/UnauthorizedError'
        },
        404: {
          $ref: '#/components/responses/NotFoundError'
        },
        500: {
          $ref: '#/components/responses/InternalServerError'
        }
      }
    }
  }
};

// Add missing response components
specs.components.responses.InternalServerError = {
  description: 'Internal server error',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/Error'
      },
      example: {
        success: false,
        error: 'Server error',
        message: 'Something went wrong on the server'
      }
    }
  }
};

module.exports = { specs, swaggerUi };