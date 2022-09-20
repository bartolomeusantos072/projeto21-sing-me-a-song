import cors from "cors";
import express,{json} from "express";
import "express-async-errors";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware";
import recommendationRouter from "./routers/recommendationRouter";

const app = express();
app.use(cors());
app.use(json());

app.use("/recommendations", recommendationRouter);
app.use(errorHandlerMiddleware);

export default app;
