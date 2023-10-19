const jwt = require("jsonwebtoken");
const Register = require("../models/registers");



const auth = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        const varifyUser = jwt.verify(token,process.env.Sectet_Key1);
        console.log(varifyUser);

        const user = await Register.findOne({_id:varifyUser._id})
        // console.log(user);
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}
module.exports = auth;