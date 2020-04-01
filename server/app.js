const path = require('path');

const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, '..', 'client', 'docs')));

//Init Middleware
//Body parser
app.use(express.json());

//Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/stocks', require('./routes/stocks'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'docs', 'index.html'));
});

module.exports = app;
