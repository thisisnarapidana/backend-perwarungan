require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const axios = require("axios");
const authRouter = express.Router();
const auth = require("../components/auth");
const socketController = require("./socketController");

const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
} = process.env;

let access_token = "";
let refresh_token = "";
let device_id = "";

// Routes
authRouter.get("/login", auth(['clerk'], true), (req, res) => {
    const scope = encodeURIComponent(
        "user-read-private user-read-email user-read-playback-state user-modify-playback-state"
    );

    res.redirect(
        `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${scope}&redirect_uri=${REDIRECT_URI}`
    );
});

authRouter.get("/callback", async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
        // Exchange code for tokens
        await exchangeCodeForTokens(code);

        // Fetch user devices
        await fetchUserDevices();

        // Set up token refresh mechanism
        setInterval(refreshToken, 1000 * 60 * 60); // 1 hour interval

        // Redirect the user back to the frontend with the tokens
        res.redirect(`http://localhost:3000`);
    } catch (error) {
        console.error("Error during authorization:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

authRouter.get("/check", auth(['clerk']), async (req, res) => {
    try {
        console.log('check');
        const validationResponse = await axios.get("https://api.spotify.com/v1/me/player/devices", 
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (validationResponse.status === 200 && validationResponse.data.devices[0].id === device_id) {
            console.log(validationResponse.status);
            res.status(200).json({ message: "Token is valid" });
        } else {
            // Token is invalid
            console.log( validationResponse.data.devices[0].id + " " + device_id );
            res.status(401).json({ error: "Token is invalid" });
        }
    } catch (error) {
        console.error("Error during token validation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Function to exchange authorization code for access token and refresh token
async function exchangeCodeForTokens(code) {
    const authOptions = {
        url: "https://accounts.spotify.com/api/token",
        method: "post",
        params: {
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
        },
        headers: {
            Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
    };

    const response = await axios(authOptions);
    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
    socketController.setAccessToken(access_token);
}

// Function to fetch user devices
async function fetchUserDevices() {
    const devicesResponse = await axios.get(
        "https://api.spotify.com/v1/me/player/devices",
        {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        }
    );

    // Check if devices exist in the response
    if (devicesResponse.data.devices && devicesResponse.data.devices.length > 0) {
        device_id = devicesResponse.data.devices[0].id;
        socketController.setDeviceId(device_id);
        console.log("User devices:", device_id);
    } else {
        console.log("No devices found for the user.");
    }
}

async function refreshToken() {
    try {
        const refreshOptions = {
            url: "https://accounts.spotify.com/api/token",
            method: "post",
            params: {
                grant_type: "refresh_token",
                refresh_token: refresh_token,
            },
            headers: {
                Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };

        const response = await axios(refreshOptions);
        access_token = response.data.access_token;
        refresh_token = response.data.refresh_token;
        socketController.setAccessToken(access_token);

        console.log("Token refreshed:", access_token);
    } catch (error) {
        console.error("Error refreshing token:", error);
    }
}

module.exports = authRouter;