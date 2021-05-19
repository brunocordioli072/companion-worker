import express from 'express';
const router = express.Router();

import spotify from './spotify';
router.use('/spotify', spotify);

export default router;
