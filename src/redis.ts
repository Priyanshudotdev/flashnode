import { createClient } from "redis";
import { IUser } from "./schema.js";

export const createRedisClient = async () => {
    const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

    return client;
}


const client = createRedisClient();

export const cacheUser = async (userId:string, user:IUser) => {
    if(!userId) return null;

    await (await client).SET(`user:${userId}`, JSON.stringify(user));
    await (await client).EXPIRE(`user:${userId}`, 60);
    
    return true;
}

export const getCachedUser = async(userId:string) => {
    if(!userId) return null;

    const rawCachedUser = await (await client).GET(`user:${userId}`);
    if(!rawCachedUser) return null;

    const cachedUser = JSON.parse(rawCachedUser);
    return cachedUser;
}

export const deleteCachedUser = async(userId:string) => {
    if(!userId) return null;

    const cachedUser = await (await client).DEL(`user:${userId}`);
    return cachedUser;
}