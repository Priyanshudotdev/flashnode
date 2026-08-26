import type { Request, Response } from "express";
import { Types } from "mongoose";
import { emailQueue } from "../background/queues/email.queue.js";
import { cacheUser, deleteCachedUser, getCachedUser } from "../config/redis.js";
import { User } from "../models/User.js";

type IUpdate = {
	city?: string;
	contact?: string;
};

export const createUser = async (req: Request, res: Response) => {
	// get the email and password
	const { email, password, city, contact } = req.body;

	// check the email and password
	if (!email || !password) {
		return res.status(400).json({
			message: "Bad request: email and password are required",
		});
	}

	// check if the user exists
	const isUserExist = await User.findOne({
		email,
	});

	// if exists then return the userId
	if (isUserExist) {
		// get from cache
		const isCached = await getCachedUser(isUserExist._id);
		if (!isCached) {
			//store it in redis
			await cacheUser(isUserExist._id, isUserExist);
		}
		return res.status(200).json({
			message: "account already exists",
			userId: isUserExist._id,
		});
	}

	// store it in database
	const user = await User.create({
		email,
		password,
		city: city ?? "",
		contact: contact ?? "",
	});
	const userId = user._id;

	//store it in redis
	await cacheUser(userId, user);

	await emailQueue.add("email-tasks", {
		email: user.email,
	});

	return res.status(201).json({
		message: "User created successfully",
		userId,
	});
};

export const getUserById = async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = new Types.ObjectId(id as string);
	const cachedUser = await getCachedUser(userId);

	if (cachedUser == null) {
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}
		await cacheUser(user._id, user);
		return res.status(200).json({
			message: "user data (no cache)",
			user: user,
		});
	}

	return res.status(200).json({
		message: "cached user data",
		user: cachedUser,
	});
};

export const updateUser = async (req: Request, res: Response) => {
	const { city, contact } = req.body;
	const { id } = req.params;

	if ((!city && !contact) || !id) {
		return res.status(400).json({
			message: "Bad request: no data to update or no user id provided",
		});
	}

	const update: IUpdate = {};
	if (city != null) update.city = city;
	if (contact != null) update.contact = contact;

	const updatedUser = await User.findOneAndUpdate(
		{ _id: id },
		{ $set: update },
		{ returnDocument: "after" },
	);

	// check if any match found : if no match found will return 404
	if (!updatedUser) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	// now update the cache or we can just delete the cache and when user reqs it will then cached
	// will just update the data directly (if user's cache is available)
	await deleteCachedUser(new Types.ObjectId(id as string));
	await cacheUser(new Types.ObjectId(id as string), updatedUser);

	return res.status(200).json({
		message: "User data updated",
		user: updatedUser,
	});
};

export const deleteUser = async (req: Request, res: Response) => {
	const { id } = req.params;

	const user = await User.findOneAndDelete({ _id: id });

	// checking if user exists or not and throwing error if not present
	if (!user) {
		return res.status(404).json({
			message: "User not found",
		});
	}

	// deleting cache before returing
	await deleteCachedUser(new Types.ObjectId(id as string));

	return res.status(200).json({
		message: "User deleted",
	});
};
