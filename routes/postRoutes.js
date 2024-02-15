const {Router} = require("express")
const multer= require("multer");

const {createPost,getPosts,getCatPosts,getPost,getUserPosts,editPost,deletePost,upload1} = require("../controllers/postControllers")
const router =Router();

const authMiddleware = require("../middleware/authMiddleware");

router.post('/',authMiddleware,upload1.single('thumbnill'),createPost);
router.get('/',getPosts);
router.get('/:id',getPost);
router.get('/categories/:category',getCatPosts);
router.get('/users/:id',getUserPosts);
router.patch('/:id',authMiddleware,upload1.single('thumbnill'),editPost);
router.delete('/:id',authMiddleware,deletePost);

module.exports= router;