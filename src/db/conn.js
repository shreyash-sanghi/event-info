require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.Sectet_Key2}`)
.then(()=>{console.log("connection sucessfully....")})
.catch((e)=>{console.log(e)})