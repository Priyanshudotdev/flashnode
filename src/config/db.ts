import mongoose from "mongoose";

export const connectToDB = async () => {
	try {
		const mongoUri =
			process.env.MONGO_URI || "mongodb://localhost:27018/first_redis_server";
		const conn = await mongoose.connect(mongoUri);
		console.log("MongoDB connected: ", conn.connection.host);
	} catch (error) {
		console.error(
			`❌ Error connecting to MongoDB: ${(error as Error).message}`,
		);
		process.exit(1);
	}
};
