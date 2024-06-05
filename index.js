const express = require("express");
const cors = require("cors");
const { connect } = require("mongoose");
const multer= require("multer");

const {notFound,errorHandler} = require("./middleware/errorMiddleware")

require("dotenv").config();

const path = require('path');
// const __dirname = path.resolve();

const userRoutes= require("./routes/userRoutes")
const postRoutes= require("./routes/postRoutes")

const app = express();

app.use('/uploads',express.static('./uploads'));
//app.use('/uploads',express.static(path.join(__dirname,'uploads')));

app.use(express.json({extended:true}));
app.use(express.urlencoded({extended:true}));
 app.use(cors({credentials:true,origin:["http://localhost:3000","https://blognest-dhaval.netlify.app","https://blognest-phi.vercel.app"]}));


app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);

app.use(notFound);
app.use(errorHandler);





// app.use(express.static(path.join(__dirname,'public')));

console.log(path.join(__dirname ,'uploads'));


connect(process.env.MONGO_URI)
  .then(
    app.listen(process.env.PORT || 5000, () => console.log(`server started on ${process.env.PORT}`))
  )
  .catch((error) => {
    console.log(error);
  });
