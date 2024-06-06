const User = require("../models/userModel");
const HttpError = require("../models/errorModel");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuid } = require("uuid");

//

// Use express-fileupload middleware

// Register a new user
// POST: api/users/register
//UNProtected

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, password2 } = req.body;
    

    if (!name || !email || !password) {
      // return res.status(422).json({ message: 'fill all fields.' });
      return next(new HttpError("Fill in all fileds", 422));
    }
    const newEmail = email.toLowerCase();
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return next(new HttpError("Email alredy exits.", 422));
    }
    
    if (password.trim().length < 6) {
      return next(
        new HttpError("password should be at least 6 characters", 422)
      );
    }
    
    if (password != password2) {
      return next(new HttpError("Password dont match", 422));
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    console.log(name+"---------"+newEmail+"--------"+hashedPass)
    const newUser = await User.create({
      name,
      email: newEmail,
      password: hashedPass,
    });
    res.status(201).json(`new user ${newUser.email}registerd`);
  } catch (err) {
    return next(new HttpError("User registestraion faild", 422));
  }
};

// LOGIN a REGISTERED USER
// POST: api/users/login
//UNProtected

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new HttpError("Fill in all feilds", 422));
    }
    const newEmail = email.toLowerCase();
    const user = await User.findOne({ email: newEmail });

    if (!user) {
      return next(new HttpError("Invalid credentials", 422));
    }

    const comparepass = await bcrypt.compare(password, user.password);
    if (!comparepass) {
      return next(new HttpError("invalid credinatials", 422));
    }

    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, id, name });
    // res.send("email");
  } catch (err) {
    return next(
      new HttpError("login faild,Please Check your Credentials" + err, 422)
    );
  }
};

// USER PROFILE
// POST: api/users/:Id
//Protected

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new HttpError("User not Found", 404));
    }
    res.status(200).json(user);
  } catch (err) {
    return next(new HttpError(err));
  }
};







// CHANGE USER AVATAR (PROFILE PICTURE)
// POST: api/users/change-avatar
//Protected
const changeNameuuid=(name)=>{
  const ext = path.extname(name);
  const newFilename = path.basename(name, ext) + uuid() + ext;
  return newFilename;
}
var profilename;

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    // const ext = path.extname(originalname);
    // const newFilename = path.basename( originalname, ext) + uuid() + ext;
    const newFilename = changeNameuuid(originalname);
    profilename=newFilename;
    cb(null, newFilename);
  },
});
const upload1 = multer({ storage: storage });

const changeAvtar = async (req, res, next) => {
  try {
    // const imageUrl={req.file.filename}
    if(!req.file){
      return next(new HttpError("please choosean image",422));
     }

      //  find usser from database
  const user = await User.findById(req.user.id);
  //delete old avatar if exits
  if(user.avatar){
    fs.unlink(path.join(__dirname,"..",'uploads',user.avatar),(err)=>{
           if(err){
             return next(new HttpError(err+"3"));
           }
         })
  }


  if(req.file.size >500000){
    return next(new HttpError("profile picture too big .should be less than 600kb",422))
   }
     
    const updateAvatar = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: profilename},
      { new: true }
    );
    if (!updateAvatar) {
      return next(new HttpError("Avatar does not changed", 422));
    }
    res.status(200).json(updateAvatar);
  } catch (err) {
    // Handle any other errors that might occur

    return next(new HttpError(err+"=rooooo"));
  }
};



// {
//   fieldname: 'avatar',
//   originalname: '48917 (1).jpg',
//   encoding: '7bit',
//   mimetype: 'multipart/form-data',
//   destination: './uploads',
//   filename: '48917 (1)b16065ca-7ea2-4624-aa7c-0f1326097fe8.jpg',
//   path: 'uploads\\48917 (1)b16065ca-7ea2-4624-aa7c-0f1326097fe8.jpg',
//   size: 2962484
// }







//     if(!req.files.avatar){
//       return next(new HttpError("please choosean image",422));
//      }

// //   // find usser from database
//   const user = await User.findById(req.user.id);
//   //delete old avatar if exits
//   if(user.avatar){
//    fs.unlink(path.join(__dirname,"..",'uploads',user.avatar),(err)=>{
//      if(err){
//        return next(new HttpError(err+"3"));
//      }
//    })
//   }

//   const {avatar}= req.files;

//   // check file size

//   if(avatar.size >50000){
//    return next(new HttpError("profile picture too big . should be less than 500kb",422))
//   }
//  let fileName;
//  fileName=avatar.name;
//  let spilttedFilename =fileName.split('.');
//  let newFilename = spilttedFilename[0]+ uuid()+'.'+spilttedFilename[spilttedFilename.length()-1]
//  avatar.mv(path.join(__dirname,'..','uploads',newFilename),async (err)=>{
//    if(err){
//      return next(new HttpError(err+"2"))
//    }
//    const updateAvatar= await User.findByIdAndUpdate(req.user.id,{avatar:newFilename},{new:true});
//    if(!updateAvatar){
//      return next(new HttpError("Avatar does not changed",422))
//    }
//    res.status(200).json(updateAvatar)
//  })

// CHANGE USER AVATAR (PROFILE PICTURE)
// Patch: api/users/edit-user
//Protected

const editUser = async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword, newConfirmPassword } = req.body;
     
    console.log(name, email, currentPassword, newPassword, newConfirmPassword);

    if (!name || !email  || !currentPassword || !newPassword) {
      return next(new HttpError("fill in feilds", 422));
    }
    

    //get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new HttpError("User not found", 422));
    }

    //make sure new email doesen't alredy exist
    const emailExist = await User.findOne({ email });
    //we want to update other details with or without changing the email - which is a unique id beacuse we use  it to login

    if (emailExist && emailExist._id != req.user.id) {
      return next(new HttpError("Email alredy exist", 422));
    }

    //compare current passowrd to db password
    const validateUserPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validateUserPassword) {
      return next(new HttpError("Invalid current password", 422));
    }
    //compare new password
    if (newPassword !== newConfirmPassword) {
      return next(new HttpError("new Passwword does'nt match", 422));
    }

    // hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    //update user info in databse

    const newInfo = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, password: hash },
      { new: true }
    );

    res.status(200).json(newInfo);
  } catch (err) {
    return next(new HttpError(err));
  }
};

// CHANGE USER AVATAR (PROFILE PICTURE)
// POST: api/users/authors
//Protected
const getAuthors = async (req, res, next) => {
  try {
    const authors = await User.find().select("-password");
    if (!authors) {
      return next(new HttpError("athors not Found", 404));
    }
    res.json(authors);
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  changeAvtar,
  editUser,
  getAuthors,
  upload1,
};
