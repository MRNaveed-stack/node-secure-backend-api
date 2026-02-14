require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());


connectDB();
app.use('/api/auth', authRoutes);
app.use('/api', require('./routes/productRoutes'));
app.listen(5000, () => (console.log('Server started on port 5000')));

