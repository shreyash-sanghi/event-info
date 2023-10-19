require('dotenv').config()
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const employSchema = new mongoose.Schema({
    
    firstname:{
     type:String,
     required:true,
     trim:true,
     minlength :[2,"Name are greater then 2 word"]
    },
    lastname:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
    type:String,
    required:true,
    unique:true,
    validate(value){
     if(!validator.isEmail(value)){
        throw new Error("Email is invalid")
     }
    }
    },
    gender:{
        type:String,
        required:true,
    },
    number:{
        type:Number,
        required:true,
        minlength:[10]
    },
    age:{
        type:String,
        required:true
    },
    password:{
     type:String,
     required:true,
    //  validate(value){
    //     if(!validator.isStrongPassword(value)){
    //         throw new Error("Its not a strong password")
    //     }
    //  }
    },
    cpassword:{
        type:String,
        required:true,
    },
    images:{
        type:String,
    //     required:true
    },
    tokens:[{
       token:{
        type:String,
        require:true
       }
    }]

})

   //gernate tokens
employSchema.methods.generateAuthToken = async function(){
    try {
        console.log(this._id);
        const Token = jwt.sign({_id:this._id},process.env.Sectet_Key1);
        this.tokens = this.tokens.concat({token:Token})
        return Token;
    } catch (error) {
      console.log(error);
    }
}
employSchema.methods.Logintoken = async function(){
    try {
        const Token = jwt.sign({_id:this._id},process.env.Sectet_Key1);
        this.tokens = this.tokens.concat({token:Token})
        await this.save();
        return Token;

    } catch (error) {
       console.log(error);
    }
}

//bscript password
employSchema.pre("save",async function(next){
    if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password,10);
    this.cpassword = await bcrypt.hash(this.password,10);
    }
    next();
})

//Define model
const Register = new mongoose.model("Register",employSchema);
module.exports = Register;