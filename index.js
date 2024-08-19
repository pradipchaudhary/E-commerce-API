import express, { json } from "express";
import { config } from "dotenv";

const app = express();

app.use(json());

app.get("/", (req, res) => {
    res.send("Home route !");
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
