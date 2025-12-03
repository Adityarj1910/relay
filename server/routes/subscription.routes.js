import { Router } from "express";
import {
    getAllSubscription,
    createSubscription,
    getSubscriptionByName,
    getSubscriptionById,
    getSubscriptionByNextBillingDate,
    updateSubscription,
    deleteSubscription
} from "../controllers/subscriptionController.js";
import { verifyJWT } from "../middleware/auth.js";

const subscriptionRouter = Router();

subscriptionRouter.route("/").get(verifyJWT, getAllSubscription);
subscriptionRouter.route("/create").post(verifyJWT, createSubscription)
subscriptionRouter.route("/getSubscriptionByName").get(verifyJWT, getSubscriptionByName)
subscriptionRouter.route("/getSubscriptionById/:id").get(verifyJWT, getSubscriptionById)
subscriptionRouter.route("/getSubscriptionByNextBillingDate").get(verifyJWT, getSubscriptionByNextBillingDate)
subscriptionRouter.route("/update/:id").put(verifyJWT, updateSubscription)
subscriptionRouter.route("/delete/:id").delete(verifyJWT, deleteSubscription)

export default subscriptionRouter;