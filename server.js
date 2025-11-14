require('dotenv').config();
const PORT = process.env.PORT || 2000;
const express = require('express');
const mongoose = require('mongoose');
const DB = process.env.DB_URI;
const authRouter = require('./routers/auth');
const userRouter = require('./routers/user');
const messageRouter = require('./routers/message');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const otp = require('otp-generator');

app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);
app.use(morgan('combined'));

io.on('connection', (socket) => {
  socket.emit("welcome", "Welcome to the Socket.IO server!");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(socket.id, "joined room", roomId);
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", { userName });
  });

  socket.on("message", (data) => {
    console.log("Client says:", data);
    socket.emit("reply", `Server received: ${data}`);
    socket.broadcast.emit("broadcast", `${socket.id} sent: ${data}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use('/api/v1', authRouter);
app.use('/api/v1', userRouter);
app.use('/api/v1', messageRouter);

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

const swaggerSpec = swaggerJSDoc(options);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', (req, res) => {
  res.send('Welcome to my page')
})

mongoose.connect(DB).then(() => {
  console.log('Connected to DB');
  server.listen(PORT, () => {
    console.log('Server is running on Port:', PORT)
  })
}).catch((error) => {
  console.log('Error connecting to DB:', error)
});