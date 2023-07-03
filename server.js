// All server,database and app related config here

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app')



// console.log(process.env);

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
})
// We have to specify in package.json that this is the entry point when starting the app