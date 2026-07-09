const mongoose = require('mongoose');

require('dotenv').config();

const connectionString = process.env.dbConnectionString;

const getDbConnection = async ()=>{
await mongoose.connect(connectionString).then(()=>console.log('connected to database.')).catch((error)=>console.log('Error Connecting to the Database.', error));   
}

module.exports = {getDbConnection}