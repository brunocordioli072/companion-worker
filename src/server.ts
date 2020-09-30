import {
  NextFunction,
  Request,
  Response,
  Errback,
  ErrorRequestHandler,
} from "express";
import serverless from "serverless-http"
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "prod";
if (isProduction) {
  process.env.VIEW_URL = process.env.VIEW_URL_PROD;
  process.env.REDIRECT_URI = `${process.env.API_URL_PROD}/auth/spotify/callback`;
} else {
  process.env.VIEW_URL = process.env.VIEW_URL_DEV;
  process.env.REDIRECT_URI = `${process.env.API_URL_DEV}/auth/spotify/callback`;
}

const app = express();

app.use(cors());
import morgan from "morgan";
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));

import services from "./services";
app.use(services);

app.use(function (req: Request, res: Response, next: NextFunction) {
  var err = new Error("Not Found");
  next(err);
});

if (!isProduction) {
  app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

module.exports.handler = serverless(app);
