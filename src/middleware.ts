import type { NextFunction, Request, Response } from "express";
import { createRateLimitCache, getRateLimitCache, increamenttRateLimitCache } from "./redis.js";

export const rateLimiter = (cacheKey:string, rateLimit:number, time:number) => {
    return async (req: Request, res:Response, next:NextFunction) => {
        const ip = req.ip;
        const cacheKeyWithIp = `${cacheKey}${ip}`;
        
        if(ip){
            // check if the user is in the cache or not
            const cacheRateLimit = await getRateLimitCache(cacheKeyWithIp);
            if(!cacheRateLimit) {
                await createRateLimitCache(cacheKeyWithIp,time);
                next();
                return;
            }
            const newRateLimit = await increamenttRateLimitCache(cacheKeyWithIp);
            if(newRateLimit && Number(newRateLimit) > rateLimit){
                return res.status(429).json({
                    message: "Rate limit exceeded, please try again later"
                })
            }
            next();
        }    
    }
}