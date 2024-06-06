const Post = require("../models/postModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs")
const {v4:uuid} = require("uuid");
const HttpError = require("../models/errorModel");
const multer = require("multer");




// ====================create post
//post : api/posts
//protected


  var profilename;
  
  const storage = multer.diskStorage({
    destination: "../uploads",
    filename: (req, file, cb) => {
      const originalname = file.originalname;
      const ext = path.extname(originalname);
     
      const newFilename =  "avatar"+ uuid() + ext;    
      profilename=newFilename;
      cb(null, newFilename);
    },
  });
  const upload1 = multer({ storage: storage });

const createPost = async(req,res,next) =>{
 try {
 
    let {title,category,description} = req.body;
    if(!title || !category || !description)
    {
        return next(new HttpError("FIll in all fields and choose thumbnill",422));
    }
    
    if(!req.file){
        return next(new HttpError("please choosean image",422));
       }
        const thumbnill = req.file;

    
        if(thumbnill.size > 2000000){
            return next(new HttpError("Thumbnill tto big.FIle should be less than 2mb"))
        }

 
  
    const newPost = await Post.create({title,category,description,thumbnill:profilename,creator:req.user.id});

    if(!newPost){
        return next(new HttpError("Post could not be created",422));
    }
    profilename="";
    // find User and increate post count by 1;
    const currentUser =await User.findById(req.user.id);

    const userPostcount = currentUser.posts+1;
    await User.findByIdAndUpdate(req.user.id,{posts:userPostcount});
    res.status(200).json(newPost);

    }
  catch (error) {
    return next(new HttpError(error));
 }
}



// ====================get single post
//post : api/posts/:id
//unprotected
const getPost = async(req,res,next) =>{
    try {
        const postId=req.params.id;
        const post = await Post.findById(postId);
        if(!post){
            return next(new HttpError("Post not found",404));
        }
        res.status(200).json(post);
       } catch (error) {
        return next(new HttpError(error))
       }
}



// ====================get posts
//post : api/posts
//protected
const getPosts = async(req,res,next) =>{
    try {
        const posts= await Post.find().sort({updatedAt:-1});

        res.status(200).json(posts);

        
    } catch (error) {
        return next(new HttpError(error))
    }
}





// ====================get posts by  category
//post : api/posts/categories/:category
//protected
const getCatPosts = async(req,res,next) =>{
  try {
    const {category}=req.params;
    const catPosts=await Post.find({category}).sort({createdAt:-1});
    res.status(200).json(catPosts);
  } catch (error) {
    return next(new HttpError(error))
  }
}



// ====================get author posts
//post : api/posts/users/:id
//unprotected
const getUserPosts = async(req,res,next) =>{
    try {
        const {id}=req.params;
        const posts=await Post.find({creator:id}).sort({createdAt:-1});
        res.status(200).json(posts);
      } catch (error) {
        return next(new HttpError(error))
      }
}



// ==================== EDIT POST
//post : api/posts/:id
//protected
const editPost = async(req,res,next) =>{
    try {
     let fileName;
     let newFilename;
     let updatedPost;
     const postId=req.params.id;

//reactQuill has paragraph opening and closing tag with a break tag in between so there are 11 charcter in there already

     let {title,category,description} = req.body;
     if(!title || !category || description.length <12){
        return next(new HttpError("fill in all fields",422));
     }


     //get old thumbill from upload
     const oldPost = await Post.findById(postId);
     if(req.user.id == oldPost.creator){

     if(!req.file){
        updatedPost = await Post.findByIdAndUpdate(postId,{title,category,description},{new:true});
     }
     else {
        //get old post from datbase

        const oldPost = await Post.findById(postId);
        // delete old thumbnill from upload
        fs.unlink(path.join(__dirname,"..",'uploads',oldPost.thumbnill),async (err)=>{
            if(err){
                return next(new HttpError(err))
            }
            
        })

        //upload new Thumbnill
        const thumbnill = req.file;
        if(thumbnill.size >2000000) {
            return next(new HttpError("thumbill is too big,should be less than 2mb"));
                } 

     updatedPost = await Post.findByIdAndUpdate(postId,{title,category,description,thumbnill:profilename},{new:true});

     }
    }
     if(!updatedPost) {
        return next(new HttpError("could not update post",400))
     }

     res.status(200).json(updatedPost);
      } catch (error) {
        return next(new HttpError(error))
      }
}


// ==================== DELETE POST
//post : api/posts/:id
//protected
const deletePost = async(req,res,next) =>{
    try {
        const postId = req.params.id;
        if(!postId){
            return next(new HttpError("Post unavailable",400));
        }
        const post=await Post.findById(postId);
        const fileName = post?.thumbnill;

        //delete thummbill from uploads folder
        if(req.user.id ==post.creator)
       { fs.unlink(path.join(__dirname,'..','uploads',fileName),async (err)=>{
          if(err) {
            return next(new HttpError(err)); 
          }
          else {
            await Post.findByIdAndDelete(postId);
            //find user and reduse post by 1
            const currentUser = await User.findById(req.user.id);
            const userPostCount = currentUser ?.posts-1;
            await User.findByIdAndUpdate(req.user.id,{posts:userPostCount})
            res.status(200).json(`Post ${postId} deleted suceessfully🤩`)

          }
        })}
else {
  return next(new HttpError("Post could not be delted"));
}
        
    } catch (error) {
        return next(new HttpError(error))
    }
}


module.exports = {createPost,getPosts,getCatPosts,getPost,getUserPosts,editPost,deletePost,upload1}
