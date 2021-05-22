import {Request, Response} from 'express';
import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
const router = express.Router();

const spotifyAPI = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

router.get('/login', async (req: Request, res: Response) => {
  const redirect_uri = req.query.redirect_uri || '';
  const generateRandomString = function (length) {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  const state = generateRandomString(16);
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
  const response =
    'https://accounts.spotify.com/authorize?' +
    'response_type=code&' +
    `client_id=${process.env.SPOTIFY_CLIENT_ID}&` +
    `scope=${scope}&` +
    `redirect_uri=${redirect_uri}&` +
    `state=${state}`;
  res.send(response);
});

router.get('/credentials', async (req: Request, res: Response) => {
  const redirect_uri = req.query.redirect_uri || '';
  const code = `${req.query.code}` || '';
  spotifyAPI.setRedirectURI(`${redirect_uri}`);
  try {
    const response = await spotifyAPI.authorizationCodeGrant(code);
    res.send(response);
  } catch (e) {
    console.log(e);
  }
});

export default router;
