import type { NextFunction, Request, Response } from "express";
import { createRateLimitCache, getRateLimitCache, increamenttRateLimitCache } from "./redis.js";

export const rateLimiter = async (rateLimit:number, time:number) => {
    return async (req: Request, res:Response, next:NextFunction) => {
        const ip = req.ip;

        if(ip){
            // check if the user is in the cache or not
            const cacheRateLimit = await getRateLimitCache(ip);
            if(!cacheRateLimit) {
                await createRateLimitCache(ip, time);
                next();
                return;
            }
            const newRateLimit = await increamenttRateLimitCache(ip);
            if(newRateLimit && Number(newRateLimit) > rateLimit){
                return res.status(429).json({
                    message: "Rate limit exceeded, please try again later"
                })
            }
            next();
        }    
    }
}