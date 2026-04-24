const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send('SmartSeason API is running');
});

app.use('/auth', require('./routes/auth'));
app.use('/fields', require('./routes/fields'));
app.use('/users', require('./routes/users'));
app.use('/fields', require('./routes/notes'));
app.use('/stageRequests', require('./routes/stageRequests'));

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
