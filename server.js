// All server,database and app related config here
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app')


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  // console.log(con.connections);
  console.log('DB connection successful');
})

// console.log(process.env);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});




// We have to specify in package.json that this is the entry point when starting the app