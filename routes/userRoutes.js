const { Router } = require("express");
const multer= require("multer");
// const upload= multer({dest :"uploads/"})

const {
  registerUser,
  loginUser,
  getUser,
  changeAvtar,
  editUser,
  getAuthors,
  upload1,
} = require("../controllers/userControllers");

const authMiddleware = require("../middleware/authMiddleware");
    const router = Router();
    
    router.post("/register",registerUser);
    router.post("/login",loginUser);
    router.get("/:id",getUser);
    router.get("/",getAuthors);
    router.post("/change-avatar",authMiddleware,upload1.single('avatar'),changeAvtar);
    router.patch("/edit-user",authMiddleware,editUser);



module.exports = router;
