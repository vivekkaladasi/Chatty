import express from "express";
import {
  login,
  logout,
  signUp,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth,middleware.js";
import { checkAuth } from "../controllers/auth.controller.js";
const router = express.Router();
router.post("/signup", signUp);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute , checkAuth)
export default router;
