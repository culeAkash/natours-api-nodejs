const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourModel')


dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);


mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}).then(() => {
  // console.log(con.connections);
  console.log('DB connection successful');
})


//READ JSON file
const tours = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');

//IMPORT DATA TO DATABASE

const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    console.log('data successfully loaded');
    process.exit()
  } catch (error) {
    console.log(error);
  }
}

//DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted loaded');
    process.exit()
  } catch (error) {
    console.log(error);
  }
}

//used scripting here
if (process.argv[2] === '--import') {
  importData()
} else if (
  process.argv[2] === '--delete'
) {
  deleteData();
}

console.log(process.argv);