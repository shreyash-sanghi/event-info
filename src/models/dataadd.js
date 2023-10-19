const mongoose = require("mongoose");
const validator = require("validator");
// const bcrypt = require('bcryptjs');
// const jwt = require("jsonwebtoken");



const employSchema = new mongoose.Schema({
    
    EventName:{
     type:String,
     required:true,
     trim:true,
     minlength :[2,"Name are greater then 2 word"]
    },
    Place:{
        type:String,
        required:true,
        trim:true,
    },
    StartDate:{
    type:String,
    required:true,
    },
    EndDate:{
        type:String,
        required:true,
    },
    HostName:{
        type:String,
        required:true,
    },
    Institude:{
        type:String,
        required:true
    },
    image:{
        type:String,
    //     required:true
    },
    email:{
     type:String,
     required:true,
    },
    password:{
        type:String,
        required:true,
    },
    // tokens:[{
    //    token:{
    //     type:String,
    //     require:true
    //    }
    // }]

})

const Custom_Data = new mongoose.model("Custom_Data",employSchema);
module.exports = Custom_Data;