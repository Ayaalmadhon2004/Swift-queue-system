import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: "SwiftQueue API",
      version: '1.0.0',
      description: "API documentation for SwiftQueue",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [],   // ✅ فارغة مؤقتاً
};

export const specs = swaggerJsdoc(options);