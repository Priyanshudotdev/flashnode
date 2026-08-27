import type { Types } from "mongoose";
import { createClient } from "redis";
import type { IUser } from "../models/user.js";

export const createRedisClient = async () => {
	const client = await createClient()
		.on("error", (err) => console.log("Redis Client Error", err))
		.connect();

	return client;
};

export const client = createRedisClient();
type IUserId = Types.ObjectId;

export const cacheUser = async (userId: IUserId, user: IUser) => {
	if (!userId) return null;

	await (await client).SET(`user:${userId}`, JSON.stringify(user));
	await (await client).EXPIRE(`user:${userId}`, 60);

	return true;
};

export const getCachedUser = async (userId: IUserId) => {
	if (!userId) return null;

	const rawCachedUser = await (await client).GET(`user:${userId}`);
	if (!rawCachedUser) return null;

	const cachedUser = JSON.parse(rawCachedUser);
	return cachedUser;
};

export const deleteCachedUser = async (userId: IUserId) => {
	if (!userId) return null;

	const cachedUser = await (await client).DEL(`user:${userId}`);
	return cachedUser;
};

export const createRateLimitCache = async (cacheKey: string, time: number) => {
	if (!cacheKey) return null;

	await (await client).SET(cacheKey, 1);
	await (await client).EXPIRE(cacheKey, time);
};

export const getRateLimitCache = async (cacheKey: string) => {
	if (!cacheKey) return null;

	return await (await client).GET(cacheKey);
};

export const increamenttRateLimitCache = async (cacheKey: string) => {
	if (!cacheKey) return null;

	return await (await client).INCR(cacheKey);
};

export const decreamentRateLimitCache = async (cacheKey: string) => {
	if (!cacheKey) return null;

	return await (await client).DECR(cacheKey);
};
