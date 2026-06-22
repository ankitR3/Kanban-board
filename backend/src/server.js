import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { registerSocketEvents } from './socket/socket.js';

import 'dotenv/config';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: FRONTEND_URL
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok'
  });
});

registerSocketEvents(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
