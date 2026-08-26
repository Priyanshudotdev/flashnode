import express from "express";
import { connectToDB } from "./config/db.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ msg: "working", ip: req.ip });
});

app.use("/users", userRoutes);

connectToDB().then(() => {
    app.listen(8080, () => {
        console.log("Server listing on http://localhost:8080/");
    });
});
