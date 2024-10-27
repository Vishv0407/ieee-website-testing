const axios = require('axios');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

// OAuth2 credentials
const CLIENT_ID = process.env.CLIENT_ID; // Your Client ID
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Your Client Secret
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'; // Google API redirect URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN; // Your Refresh Token
const SENDER_EMAIL = process.env.SEND_EMAIL; // Your email

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to create a transporter with OAuth2 authentication
async function createTransporter() {
    const accessToken = await oAuth2Client.getAccessToken();

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: SENDER_EMAIL,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken.token,
        },
    });
}

// Function to send email
async function sendEmail(subject, text) {
    try {
        const transporter = await createTransporter();
        
        const mailOptions = {
            from: SENDER_EMAIL,
            to: SENDER_EMAIL, // You can add other recipients here if needed
            subject: subject,
            text: text,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
}

// Function to keep the server awake
const keepServerAwake = () => {
    setInterval(async () => {
        try {
            await axios.get('https://ieee-vishv.onrender.com'); // Replace with your actual URL
            console.log('Sent self-ping to keep server awake');
            await sendEmail('Server Awake', 'No error occurred while trying to keep the server awake.');
        } catch (error) {
            console.error('Error keeping server awake:', error.message);
            await sendEmail('Error in Keeping Server Awake', `An error occurred while trying to keep the server awake:\n\n${error.message}`);
        }
    }, 5 * 60 * 1000); // 5 minutes
};

module.exports = keepServerAwake;
