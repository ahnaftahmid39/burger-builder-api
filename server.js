const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const mongoose = require('mongoose');

const dbAddress = process.env.MONGODB_SERVER.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);

mongoose
  .connect(dbAddress, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.log('MongoDB Connection Failed!', err.message));

const port = process.env.PORT || 3004;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
