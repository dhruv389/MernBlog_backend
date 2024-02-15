// Unsupporated (404) routes
const notFound=(req,res,next)=>{
    const error= new Error(`Not found🔥🔥🔥🔥🔥-${req.originalUrl}`)
    res.status(404);
    next(error);
}


//Middleware to handle errors

const errorHandler=(error,req,res,next)=>{
    if(res.headSent){
        return next(error);
    }
    res.status(error.code||500).json({message:error.message || "An unknow error occured"})
}
module.exports ={notFound,errorHandler};