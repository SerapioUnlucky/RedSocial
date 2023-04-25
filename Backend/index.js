const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.options('*', cors());

const userRoute = require('./routes/userRoute');
const followRoute = require('./routes/followRoute');
const publicationRoute = require('./routes/publicationRoute');

app.use('/api/user', userRoute);
app.use('/api/follow', followRoute);
app.use('/api/publication', publicationRoute);

app.listen(process.env.PORT, () => console.log('Server started in port '+process.env.PORT));

mongoose.connect(process.env.DB).then(() => console.log('Connected to MongoDB')).catch(err => console.log(err));

module.exports = app;
