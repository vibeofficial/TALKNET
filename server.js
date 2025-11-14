require('dotenv').config();
const PORT = process.env.PORT || 2000;
const express = require('express');
const mongoose = require('mongoose');
const DB = process.env.DB_URI;
const authRouter = require('./routers/auth');
const userRouter = require('./routers/user');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const cors = require('cors');



const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));

app.use('/api/v1', authRouter);
app.use('/api/v1', userRouter);

app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ message: error.message })
  }
});


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation for talkNet mini',
    version: '1.0.0',
    description: 'Swagger Documentation.',
    contact: {
      name: 'JSONPlaceholder',
      url: '',
    },
  },
  servers: [
    {
      url: 'https://talknet-tr7a.onrender.com',
      description: 'production server',
    },
    {
      url: 'http://localhost:2346/api/v1',
      description: 'Development server',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // you can paste your JWT token in Swagger UI
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
}

const options = {
  swaggerDefinition,
  apis: ['./routers/*.js'],
}

const swaggerSpec = swaggerJSDoc(options)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


mongoose.connect(DB).then(() => {
  console.log('Connected to DB');
  app.listen(PORT, () => {
    console.log('Server is running on Port:', PORT)
  })
}).catch((error) => {
  console.log('Error connecting to DB:', error)
});