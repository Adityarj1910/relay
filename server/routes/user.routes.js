// import { Router } from "express";
// import { registerUser } from "../controllers/userController.js";

// const UserRouter = Router();

// UserRouter.route("/register").post(registerUser)
// export default UserRouter;


import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/userController.js";
import { verifyJWT } from "../middleware/auth.js";

const userRouter = Router();

// PUBLIC ROUTES
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser)

//SECURED ROUTES
userRouter.route("/logout").post(verifyJWT, logoutUser)

// (OTHER ROUTES BELOW)
export default userRouter;
