const { google } = require('googleapis');
const axios = require('axios');
require('dotenv').config();

// OAuth2 credentials
const CLIENT_ID = process.env.CLIENT_ID; // Your Client ID
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Your Client Secret
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'; // Google API redirect URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN; // Your Refresh Token
const SENDER_EMAIL = 'vishvboda0407@gmail.com'; // Your email

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to send email using Gmail
const sendEmail = async (subject, text) => {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = {
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: SENDER_EMAIL,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken.token,
        },
    };

    const mailOptions = {
        from: SENDER_EMAIL,
        to: SENDER_EMAIL, // Or any other recipient
        subject,
        text,
    };

    try {
        const { google } = require('googleapis');
        const gmail = google.gmail({ version: 'v1', auth: transporter.auth });

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: Buffer.from(`To: ${mailOptions.to}\nSubject: ${mailOptions.subject}\n\n${mailOptions.text}`).toString('base64'),
            },
        });

        console.log('Email sent:', res.data);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Function to keep the server awake
const keepServerAwake = () => {
    setInterval(async () => {
        try {
            await axios.get('https://ieee-vishv.onrender.com'); // Use your actual Render URL
            console.log('Sent self-ping to keep server awake');
            sendEmail('Error in Keeping Server Awake', `No error occurred while trying to keep the server awake:\n\n${error.message}`)
        } catch (error) {
            console.error('Error keeping server awake:', error.message);
            await sendEmail('Error in Keeping Server Awake', `An error occurred while trying to keep the server awake:\n\n${error.message}`);
        }
    }, 5 * 60 * 1000); // 5 minutes
};

// const keepServerAwake = () => {
//     setInterval(async () => {
//         try {
//             await axios.get('https://ieee-vishv.onrender.com'); // Use your actual Render URL
//         } catch (error) {
//             console.error('Error keeping server awake:', error.message);
//             await sendEmail('Error in Keeping Server Awake', `An error occurred while trying to keep the server awake:\n\n${error.message}`);
//         }
//     }, 15 * 60 * 1000); // 15 minutes
// };

module.exports = keepServerAwake;
