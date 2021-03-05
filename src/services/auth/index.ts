import {NextFunction, Request, Response} from 'express';
import express from 'express';
const router = express.Router();

import spotify from './spotify';
router.use('/spotify', spotify);

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors: any, key: string) => {
        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});

export default router;
