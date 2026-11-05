const jsonBody = (example) => ({ required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: true }, example } } });
const responses = { '200': { description: 'Success' }, '400': { description: 'Invalid request' } };
const auth = [{ bearerAuth: [] }];

export const openApi = {
  openapi: '3.0.3',
  info: { title: 'Pro Auto API', version: '1.0.0' },
  servers: [{ url: '/' }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {
    '/api/health': { get: { summary: 'Health check', responses } },
    '/api/products': {
      get: { summary: 'List, search and filter products', parameters: ['page','size','available','brandId','modelId','generationId','categoryId','search'].map((name) => ({ name, in: 'query', schema: { type: name === 'search' ? 'string' : 'integer' } })), responses },
      post: { summary: 'Create product (admin)', security: auth, requestBody: jsonBody({ name: 'Brake pads', price: 14500, available: 1, code: 'BRK-001', manufacturer: 'Toyota', description: 'Front pads', categoryId: 1, brandId: 2, modelId: 3, generationId: 4 }), responses },
    },
    '/api/products/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      get: { summary: 'Get product', responses },
      put: { summary: 'Update product (admin)', security: auth, requestBody: jsonBody({ price: 13500, available: 1 }), responses },
      delete: { summary: 'Delete product (admin)', security: auth, responses },
    },
    '/api/categories': { get: { summary: 'List categories', responses }, post: { summary: 'Create category (admin)', security: auth, requestBody: jsonBody({ name: 'Accessories' }), responses } },
    '/api/categories/{id}': { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], put: { summary: 'Update category (admin)', security: auth, requestBody: jsonBody({ name: 'Updated category', parentId: null }), responses }, delete: { summary: 'Delete category (admin)', security: auth, responses } },
    '/api/news': { get: { summary: 'List news', responses }, post: { summary: 'Create news (admin)', security: auth, requestBody: jsonBody({ title: 'New article', content: 'Article text' }), responses } },
    '/api/news/{id}': { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], get: { summary: 'Get news article', responses }, put: { summary: 'Update news (admin)', security: auth, requestBody: jsonBody({ title: 'Updated title', content: 'Updated text' }), responses }, delete: { summary: 'Delete news (admin)', security: auth, responses } },
    '/api/registration': { post: { summary: 'Register user', requestBody: jsonBody({ first_name: 'Test', last_name: 'User', email: 'user@example.com', password: 'secret123' }), responses } },
    '/api/auth/token': { post: { summary: 'Login', requestBody: jsonBody({ email: 'user@example.com', password: 'secret123' }), responses } },
    '/api/auth/user': { get: { summary: 'Get current user', security: auth, responses } },
    '/api/inquiries': { post: { summary: 'Submit contact request', requestBody: jsonBody({ name: 'Test User', tel: '+77001234567', email: 'user@example.com', message: 'Please contact me.' }), responses }, get: { summary: 'List contact requests (admin)', security: auth, responses } },
    '/api/reviews': { get: { summary: 'List product comments', parameters: [{ name: 'productId', in: 'query', required: true, schema: { type: 'integer' } }], responses }, post: { summary: 'Add product comment', security: auth, requestBody: jsonBody({ product_id: 1, review: 'Good part, recommended.' }), responses } },
    '/api/reviews/exists': { get: { summary: 'Check whether current user commented', security: auth, parameters: [{ name: 'productId', in: 'query', required: true, schema: { type: 'integer' } }], responses } },
    '/api/cart': { get: { summary: 'Get current user cart', security: auth, responses } },
    '/api/cart/items': { post: { summary: 'Add product to cart', security: auth, requestBody: jsonBody({ productId: 1, count: 1 }), responses } },
    '/api/cart/items/{id}': { parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], patch: { summary: 'Change quantity by delta (+1 or -1)', security: auth, requestBody: jsonBody({ delta: 1 }), responses }, delete: { summary: 'Remove cart item', security: auth, responses } },
    '/api/orders': { get: { summary: 'Current user order history', security: auth, responses }, post: { summary: 'Place order from current cart', security: auth, requestBody: jsonBody({ phone: '+77001234567', area: 'Region', city: 'City', street: 'Street', house: '1', apartment: '2' }), responses } },
    '/api/uploads': { post: { summary: 'Upload image (admin; multipart field image, max 5 MB)', security: auth, requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } }, required: ['image'] } } } }, responses } },
    '/api/brands': { get: { summary: 'List product brands', responses } },
    '/api/models': { get: { summary: 'List models by brandId', parameters: [{ name: 'brandId', in: 'query', required: true, schema: { type: 'integer' } }], responses } },
    '/api/generations': { get: { summary: 'List generations by modelId', parameters: [{ name: 'modelId', in: 'query', required: true, schema: { type: 'integer' } }], responses } },
  },
};
