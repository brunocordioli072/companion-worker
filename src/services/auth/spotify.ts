import {Request, Response} from 'express';
import request from 'request';
import express from 'express';

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const VIEW_URL = process.env.VIEW_URL;
const REDIRECT_URI = process.env.REDIRECT_URI;
const STATE_KEY = 'spotify_auth_state';

const querystring = require('querystring');

const generateRandomString = function (length: number) {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/login', (req: Request, res: Response) => {
  const state = generateRandomString(16);
  res.cookie(STATE_KEY, state);

  // your application requests authorization
  const scope = `user-read-private 
  user-library-read
  user-library-modify
  user-read-email
  user-top-read
  user-read-recently-played
  user-read-playback-position
  playlist-read-collaborative
  playlist-read-private
  playlist-modify-private 
  playlist-modify-public `;
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state,
      })
  );
});

router.get('/callback', (req: Request, res: Response) => {
  const code = req.query.code || null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const state = req.query.state || null;
  const error = req.query.error || null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const storedState = req.cookies ? req.cookies[STATE_KEY] : null;
  if (error && error === 'access_denied') {
    res.redirect(`${VIEW_URL}?error=access_denied`);
  }
  res.clearCookie(STATE_KEY);
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' +
        // eslint-disable-next-line node/no-deprecated-api
        new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
    },
    json: true,
  };
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const expires_in = body.expires_in;
      const access_token = body.access_token;
      const refresh_token = body.refresh_token;
      res.redirect(
        `${VIEW_URL}?access_token=${access_token}&expires_in=${expires_in}&refresh_token=${refresh_token}`
      );
    } else {
      res.redirect(`${VIEW_URL}?error=invalid_token`);
    }
  });
});

router.get('/refresh_token', (req: Request, res: Response) => {
  // requesting access token from refresh token
  const refresh_token = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        // eslint-disable-next-line node/no-deprecated-api
        new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

export default router;
