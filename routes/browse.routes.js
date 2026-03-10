import express from "express";
import { browseProfiles } from "../controllers/browse.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, browseProfiles);


export default router;