import { requireAuth, clerkClient } from "@clerk/express";
import User from "../models/User.model.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;

     

      if (!clerkId) {
        return res.status(401).json({ msg: " Unauthorize: invalid token" });
      }

      let user = await User.findOne({ clerkId });

      if (!user) {
        const cu = await clerkClient.users.getUser(clerkId);
        const name =
          (cu.firstName && cu.lastName
            ? `${cu.firstName} ${cu.lastName}`
            : "") ||
          cu.username ||
          cu.emailAddresses?.[0]?.emailAddress ||
          "User";
        const email = cu.emailAddresses?.[0]?.emailAddress || "";
        const profileImage = cu.imageUrl || "";

        user = await User.findOneAndUpdate(
          { clerkId },
          { clerkId, name, email, profileImage },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json("internal server error");
    }
  },
];
