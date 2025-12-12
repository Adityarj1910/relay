import { Router } from "express";
import {
    getMyInvitations,
    acceptInvitation,
    declineInvitation,
    cancelInvitation
} from "../controllers/invitationController.js";
import { verifyJWT } from "../middleware/auth.js";

const invitationRouter = Router();

// All routes require authentication
invitationRouter.route("/my").get(verifyJWT, getMyInvitations);
invitationRouter.route("/:id/accept").put(verifyJWT, acceptInvitation);
invitationRouter.route("/:id/decline").put(verifyJWT, declineInvitation);
invitationRouter.route("/:id").delete(verifyJWT, cancelInvitation);

export default invitationRouter;
