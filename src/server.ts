import {NextFunction, Request, Response} from 'express';
import serverless from 'serverless-http';
import express from 'express';
// eslint-disable-next-line node/no-extraneous-import
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

app.use(cors());
import morgan from 'morgan';
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

import services from './services';
app.use(services);

app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error('Not Found');
  next(err);
});

app.use((err: any, req: Request, res: Response) => {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: err,
    },
  });
});

app.use((err: any, req: Request, res: Response) => {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

module.exports.handler = serverless(app);
