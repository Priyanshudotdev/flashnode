import { createClient } from "redis";
import { IUser } from "./schema.js";
import { Types } from "mongoose";

export const createRedisClient = async () => {
    const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

    return client;
}


const client = createRedisClient();
type IUserId = Types.ObjectId;

export const cacheUser = async (userId:IUserId, user:IUser) => {
    if(!userId) return null;

    await (await client).SET(`user:${userId}`, JSON.stringify(user));
    await (await client).EXPIRE(`user:${userId}`, 60);
    
    return true;
}

export const getCachedUser = async(userId:IUserId) => {
    if(!userId) return null;

    const rawCachedUser = await (await client).GET(`user:${userId}`);
    if(!rawCachedUser) return null;

    const cachedUser = JSON.parse(rawCachedUser);
    return cachedUser;
}

export const deleteCachedUser = async(userId:IUserId) => {
    if(!userId) return null;

    const cachedUser = await (await client).DEL(`user:${userId}`);
    return cachedUser;
}

export const createRateLimitCache = async (ip:string, time: number) => {
    if(!ip) return null;

    await (await client).SET(`rate-limit:ip:${ip}`, 1);
    await (await client).EXPIRE(`rate-limit:ip:${ip}`, time);
}

export const getRateLimitCache = async (ip:string) => {
    if(!ip) return null;
    
    return await (await client).GET(`rate-limit:ip:${ip}`);
}

export const increamenttRateLimitCache = async(ip:string) => {
    if(!ip) return null;

    return await (await client).INCR(`rate-limit:ip:${ip}`);
}

export const decreamentRateLimitCache = async(ip:string) => {
    if(!ip) return null;

    return await (await client).DECR(`rate-limit:ip:${ip}`);
}