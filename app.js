const express = require('express');
const app = express();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');


const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader.indexOf('Basic ') !== 0) {
    res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
    return res.status(401).send({ message: 'Authentication required.' });
  }

 
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');


  const validUser = username === 'admin' && password === 'password';
  if (!validUser) {
    return res.status(401).send({ message: 'Invalid credentials.' });
  }

  next();
};


const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          headers: {
            WWW_Authenticate: {
              schema: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    security: [
      {
        basicAuth: [],
      },
    ],
  },
  apis: ['app.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


app.use(basicAuth);

/**
 * @swagger
 * /books:
 *   get:
 *     description: Get all books
 *     security:
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
app.get('/books', (req, res) => {
  res.send([
    {
      id: 1,
      title: 'Harry Potter',
    },
  ]);
});

/**
 * @swagger
 * /books:
 *   post:
 *     description: Add a new book
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - name: title
 *         description: Title of the book
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
app.post('/books', (req, res) => {
  res.status(201).send();
});

app.listen(5001, () => console.log('Listening on port 5001'));
