import { Router } from "express"
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()
router.use(verifyJWT)

// Toggle subscribe/unsubscribe to a channel
router.route("/c/:channelId").post(toggleSubscription)

// Get all subscribers of a channel
// Query params: ?page=1&limit=10
router.route("/subscribers/:channelId").get(getUserChannelSubscribers)

// Get all channels a user has subscribed to
// Query params: ?page=1&limit=10
router.route("/subscriptions/:userId").get(getSubscribedChannels)

export default router