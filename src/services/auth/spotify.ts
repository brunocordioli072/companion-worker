import { Request, Response } from "express";
import request from "request";
import express from "express";
const router = express.Router();

const VIEW_URL = process.env.VIEW_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const STATE_KEY = "spotify_auth_state";

let querystring = require("querystring");

let generateRandomString = function (length: number) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get("/login", function (req: Request, res: Response) {
  let state = generateRandomString(16);
  res.cookie(STATE_KEY, state);

  // your application requests authorization
  let scope = `user-read-private 
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
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state,
      })
  );
});

router.get("/callback", function (req: Request, res: Response) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var error = req.query.error || null;
  var storedState = req.cookies ? req.cookies[STATE_KEY] : null;
  if (error && error == "access_denied") {
    res.redirect(`${VIEW_URL}?error=access_denied`);
  }
  res.clearCookie(STATE_KEY);
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    },
    json: true,
  };
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      let expires_in = body.expires_in;
      let access_token = body.access_token;
      let refresh_token = body.refresh_token;
      res.redirect(
        `${VIEW_URL}?access_token=${access_token}&expires_in=${expires_in}&refresh_token=${refresh_token}`
      );
    } else {
      res.redirect(`${VIEW_URL}?error=invalid_token`);
    }
  });
});

router.get("/refresh_token", function (req: Request, res: Response) {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

export default router;
