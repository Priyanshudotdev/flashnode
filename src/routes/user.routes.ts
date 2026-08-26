import { Router } from "express";
import type { Request, Response } from "express";
import { Types } from "mongoose";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { cacheUser, deleteCachedUser, getCachedUser } from "../config/redis.js";
import { User } from "../models/User.js";

const router = Router();

type IUpdate = {
    city?: string,
    contact?: string
}

router.post("/", rateLimiter("rate-limit:POST:/users:", 5, 60), async (req: Request, res: Response) => {
    // get the email and password
    const { email, password, city, contact } = req.body;
    
    // check the email and password
    if(!email || !password) {
        return res.status(400).json({
            message: "Bad request: email and password are required"
        })
    }

    // check if the user exists
    const isUserExist = await User.findOne({
        email
    });

    // if exists then return the userId
    if(isUserExist){
        // get from cache
        const isCached = await getCachedUser(isUserExist._id);
        if(!isCached){
            //store it in redis
            await cacheUser(isUserExist._id, isUserExist);
        }
        return res.status(200).json({
            message: "account already exists",
            userId : isUserExist._id
        })
    }

    // store it in database
    const user = await User.create({
        email,
        password,
        city: city ?? "",
        contact: contact ?? ""
    })
    const userId = user._id;
    
    //store it in redis
    await cacheUser(userId, user);

    return res.status(201).json({
        message: "User created successfully",
        userId
    });
});

router.get("/:id", rateLimiter("rate-limit:GET:/users:id:", 60, 60), async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = new Types.ObjectId(id as string);
    const cachedUser = await getCachedUser(userId);

    let user: any = null;
    if(cachedUser == null){
        user = await User.findById(id);
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        await cacheUser(user._id, user);
        return res.status(200).json({
            message: "user data (no cache)",
            user: user
        })
    }

    return res.status(200).json({
        message: "cached user data",
        user: cachedUser
    })
});

router.put("/:id", rateLimiter("rate-limit:PUT:/users:id:", 20, 60), async (req: Request, res: Response) => {
    const { city, contact } = req.body;
    const { id } = req.params;

    if(!city && !contact || !id) {
        return res.status(400).json({
            message: "Bad request: no data to update or no user id provided"
        })
    }

    const update: IUpdate = {};
    if(city != null) update.city = city;
    if(contact != null) update.contact = contact;

    const updatedUser = await User.findOneAndUpdate({_id: id}, {$set: update}, { returnDocument: "after" });
    
    // check if any match found : if no match found will return 404
    if(!updatedUser){
        return res.status(404).json({
            message: "User not found"
        })
    }

    // now update the cache or we can just delete the cache and when user reqs it will then cached
    // will just update the data directly (if user's cache is available)
    await deleteCachedUser(new Types.ObjectId(id as string));
    await cacheUser(new Types.ObjectId(id as string), updatedUser);
    
    return res.status(200).json({
        message: "User data updated",
        user: updatedUser
    })
});

router.delete("/:id", rateLimiter("rate-limit:DELETE:/users:id:", 10, 60), async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await User.findOneAndDelete({_id: id});

    // checking if user exists or not and throwing error if not present
    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }

    // deleting cache before returing
    await deleteCachedUser(new Types.ObjectId(id as string));

    return res.status(200).json({
        message: "User deleted"
    })
});

export default router;
