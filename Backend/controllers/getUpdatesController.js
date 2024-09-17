const GetUpdates = require('../models/get-updates');
const nodemailer = require('nodemailer');
const GetUpdatesUser = require('../email-templates/getUpdatesUser');
const { google } = require('googleapis');

require('dotenv').config();

// Nodemailer setup
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

const CLIENT_ID = '804408240542-musltguj9can2gn3rlc2d0j2j9erchdq.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04pmPSR2oxML8CgYIARAAGAQSNwF-L9IrZ1gLQNnU27wfaUI6VgY63YTfW3L623m6gWm8oMR0vUNyrttzpE6xIa9zDVuYaYGgbgs';

// Create an OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const accessToken = await oAuth2Client.getAccessToken();

    // Set up Nodemailer transport
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'vishvkumar.b@ahduni.edu.in', // Your full email address
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token, // Provide the token here
      },
    });

exports.getUpdatesEnroll = async (req, res) => {
    const { name, email } = req.body;
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

    try {
        // Calculate the row count
        const rowCount = await GetUpdates.countDocuments() + 1;

        // Insert data into MongoDB with rowCount
        const newUpdate = new GetUpdates({ name, email, date: formattedDate, time: formattedTime, rowCount });
        await newUpdate.save();

        // Send email notification to Admin
        const mailOptionsAdmin = {
            from: 'vishvkumar.b@ahduni.edu.in',
            to: 'vishvboda0407@gmail.com',
            subject: 'New Get Updates submission',
            text: `I want updates of your events:\n\nName: ${name}\nEmail: ${email} \nDate: ${formattedDate}\nTime: ${formattedTime}`
        };

        await transporter.sendMail(mailOptionsAdmin);
        console.log('Email sent to Admin');


        // Send email notification to User
        const mailOptionsUser = {
            from: 'vishvkumar.b@ahduni.edu.in',
            to: email,
            subject: 'Thank you for connecting to IEEE AUSB!',
            html:  GetUpdatesUser(`${name}`) // Use the template function to set the HTML body
        };

        await transporter.sendMail(mailOptionsUser);
        console.log('Email sent to User');

        res.json({ message: 'Success' });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error('Error occurred:', err);
        res.status(500).json({ message: 'Error occurred, please try after some time', error: err.message });
    }
};

exports.getUpdates = async (req, res) => {
    try {
        const updates = await GetUpdates.find().select('name email date time rowCount');
        res.json(updates);
    } catch (err) {
        res.status(500).send('Error fetching updates data');
    }
};

