const jwt = require("jsonwebtoken");
const Register = require("../models/registers");



const pro = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        const varifyUser = jwt.verify(token,process.env.Sectet_Key1);
        const user = await Register.findOne({_id:varifyUser._id})
        // console.log(user.email);
        req.user = user.email;
        req.password = user.password;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send("error"+error);
    }
}
module.exports = pro;