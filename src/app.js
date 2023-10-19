const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const Register = require("./models/registers.js");
const Custom_Data = require("./models/dataadd.js");
const auth = require("./middleware/auth");
const pro = require("./middleware/pro");
const nodemailer = require("nodemailer");    //for sending male
const { platform } = require("os");
require("./db/conn");
const port = process.env.PORT || 8000;
const session = require('express-session');
const flash = require('connect-flash');




//Define path
const staticpath = path.join(__dirname, "../public");
const images = path.join(__dirname, "../public/images");
const templatpath = path.join(__dirname, "../template/views");
const partialspath = path.join(__dirname, "../template/partials");


//express set command
app.set("view engine", "hbs");
app.set("views", templatpath);
hbs.registerPartials(partialspath);


//express mideal Bear use command
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(staticpath));

const Jwt_Secret = "shchcxbhhhcvhgvcchgchcccscssssccx";

//Session Midelware set
app.use(session({      
    secret:"abcdefghijkl",
    cookie:{message:6000},
    saveUninitialized:true,
    resave:true
}))
//Fless Midelware
app.use(flash());


app.use((req,res,next)=>{
   res.locals.sucess= req.flash("sucess");
   res.locals.Err = req.flash("Err");
   next();
})
//product image 
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,images)
    },

    filename:(req,file,cb)=>{
        console.log(file)
        cb(null,Date.now()+path.extname(file.originalname))
    }
})
const uplode = multer({storage:storage}).single('image')   //image midelware


//Fore Email

// app.get("/Email", async (req,res)=>{


//     //connect with the smtp

//     const transporter = await nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         auth: {
//             user: 'winona60@ethereal.email',
//             pass: 'z2TP712zej4zqV6q5Y'
//         }
//     });


//     const info = await transporter.sendMail({
//         from: '"Fred Foo 👻" <winona60@ethereal.email>', // sender address
//         to: "sheryash123jain@gmail.com", // list of receivers
//         subject: "Hello Bittu", // Subject line
//         text: "Hello world?", // plain text body
//         html: "<b>Hello world?</b>", // html body
//       });

//       console.log("Message sent: %s", info.messageId);

//       res.send(info);
// })

//Home Page
app.get("/", (req, res) => {
    res.render('index')
})

//Registration Page
app.get("/register", (req, res) => {
    res.render('register')
})
app.post("/register",async (req, res) => {
    try {
        const Password = req.body.password;
        const Cpassword = req.body.cpassword;
        if (Password == Cpassword) {
            const registeremploy = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                number: req.body.number,
                age: req.body.age,
                password: Password,
                cpassword: Cpassword,  
            })
            const token = await registeremploy.generateAuthToken();
            await registeremploy.save();
            // const Custom_Data = require("./models/dataadd.js");
            req.flash("sucess","Your Registration Have Sucessfully Done...")
            res.status(201).redirect("login");
        } else {
            req.flash("Err","They have any Error please you can Register again...")
            res.status(404).redirect("register");
        }
    } catch (e) {
        res.status(404).send(`They have error ${e}`);
    }
})

//Login Page
app.get("/login", (req, res) => {
    res.render('login')
})
app.post("/login", async (req, res) => {
    try {
        const Email = req.body.email;
        const Password = req.body.password;
        const userEmail = await Register.findOne({ email: Email });
        const isMatch = await bcrypt.compare(Password, userEmail.password);
      

        if (isMatch) {
            for(let i=0; i<userEmail.tokens.length;i++){
                userEmail.tokens.shift();
            }
            const token = await userEmail.Logintoken();
            res.cookie("jwt",token)
            res.status(200).redirect("PersonalPage");
        }
        else {
            res.send("Invalid login detail")
        }
    } catch (e) {
        res.status(400).send("Invalid login detail" + e)
    }
})

//logOut Page
app.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currentElement) => {
            return currentElement.token != req.token
        })
        res.clearCookie("jwt");
        await req.user.save();
        res.render("login")
    } catch (error) {
        res.status(401).send(error)
    }
})

//Forgit Password
app.get("/forgotPassword", (req, res,next) => {
    res.render('forgotPassword');
})
app.get("/resetPassword/:id/:token", async (req, res,next) => {
    const {id,token} = req.params;
    const user = await Register.find({_id:id});
    const secret = Jwt_Secret+ user.password;
    const payload ={
        Email:user.email,
        id:user.id
    }
    console.log(secret);
    try {
 
        res.render("resetPassword",{email:user.email})
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
})
app.post("/resetPassword/:id/:token", async(req,res)=>{
    const {id,token} = req.params;
    const user = await Register.find({_id:id});
    const {Password,CPassword} = req.body;
    try {
        user.password = Password;
        user.cpassword = CPassword;
    } catch (error) {
        console.log(error);
        res.status(404).send(error);
    }
     res.send(user);
})
app.post("/forgotPassword", async (req, res,next) => {
    try {
        const Email = req.body.email;
        const user = await Register.findOne({ email: Email });
        console.log(user.email);
        if(Email!= user.email){
            res.send("user is not register");
            return;
        }
        const secret = Jwt_Secret + user.password ;
        const payload ={
            Email:user.email,
            id:user.id
        }
        const token = jwt.sign(payload,secret,{expiresIn:'10m'});
        const link = `http://127.0.0.1:8000/resetPassword/${user.id}/${token}`
        console.log(link)
        res.send("Password reset link have been send ..")
        // if (userEmail) {
        //     const link = `http://locolhost:${port}/resetPassword/${userid}/${token}`;
        //     console.log(link);
        //     res.status(201).render("featurs");
        // }
        // else {
        //     res.send("Invalid login detail")
        // }
    } catch (error) {
        console.log(error)
        res.send("This Acount are not Register")
    }                                                                                                          

})

//New Events
app.get("/events", async (req, res) => {
    try{
        const data = await Custom_Data.find(
        );
         res.status(201).render("events",{data:data});
        }catch(e){
            res.status(404).send(e);
        }
})

//Personal DesBoard
app.get("/PersonalPage",pro,async (req, res) => {
    let d = req.user;
    const data = await Custom_Data.find({
     email: d
    });
    res.status(201).render("PersonalPage",{data:data});
})

//Delete 
app.post("/PersonalPage/:id",async (req, res) => {
    try {
        const _id = req.params.id;
        const deletedata = await Custom_Data.findByIdAndDelete(_id);
       req.flash("sucess","Data have Sucessfully Deleted... ")
       res.redirect("/PersonalPage");
    } catch (error) {
        console.log("error");
    }

  })

 //Detail Update
app.get("/edit/:id", async (req,res)=>{
    try {
        const _id = req.params.id;
        const find = await Custom_Data.findById(_id);
        res.status(200).render("edit",{
            _id :_id,
            EventName:find.EventName,
            Place:  find.Place,
            StartDate:find.StartDate,
            EndDate: find.EndDate,
            HostName: find.HostName,
            Institude: find.Institude
        });
    } catch (error) {
        res.status(404).send(error);
    }
})
app.post("/edit/:id",async (req,res)=>{
    try{
        const _id = req.params.id;
        const up = await Custom_Data.updateOne({ _id},{
            $set :{
                EventName:req.body.EventName,
                Place:  req.body.Place,
                StartDate:req.body.StartDate,
                EndDate: req.body.EndDate,
                HostName: req.body.HostName,
                Institude: req.body.Institude
            }
        })
        req.flash("sucess","Data have Update Sucessfully Edit...")
        res.redirect("/PersonalPage");
    }catch(error){
       req.flash("Err","Data have not update... ")
       res.redirect("/edit/:id");
    }
})

//To Gen New Update
 app.get("/secret",(req,res)=>{
    res.render("secret");
 })
 app.post("/secret", uplode,pro,async (req, res) => {

    try{
        const password = req.body.password;
        const email = req.body.email;
       let em = req.user;
       let pa = req.password;
       const isMatch = await bcrypt.compare(password, pa);
     const registerdata = new Custom_Data({
        EventName: req.body.EventName ,
        Place: req.body.Place,
        StartDate:req.body.StartDate,
        EndDate:req.body.EndDate,
        HostName: req.body.HostName,
        Institude:req.body.Institude,
        image:req.file.filename,
        email:email ,
        password:password ,
    })
    if(email == em && isMatch==true){
    await registerdata.save();
    req.flash("sucess","Data have Sucessfully Add... ")
    res.status(201).redirect("PersonalPage");
    }else{
        req.flash("Err","Invalid Personal Detail...")
        res.redirect("secret");
    }
    }catch(error){
      res.send(error);
    }
})

 
app.listen(port, () => { console.log(`Server lisen on port ${port}`) })