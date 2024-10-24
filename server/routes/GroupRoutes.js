import { Router } from "express";

import {
  createGroup,
  getGroupMessages,
  getUserGroups,
  getGroupMembers,
} from "../controllers/GroupControllers.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const groupRoutes = Router();

groupRoutes.post("/create-group", verifyToken, createGroup);
groupRoutes.get("/get-user-groups", verifyToken, getUserGroups);
groupRoutes.get("/get-group-messages/:groupId", verifyToken, getGroupMessages);
groupRoutes.get("/get-group-members/:groupId", verifyToken, getGroupMembers);

export default groupRoutes;