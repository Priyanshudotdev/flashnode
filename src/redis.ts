import { createClient } from "redis";

export const createRedisClient = async () => {
    const client = await createClient()
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();

    return client;
}
