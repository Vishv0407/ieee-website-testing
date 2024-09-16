const contactUsUser = require('../email-templates/contactUsUser');
const ContactUsDetail = require('../models/contact-us');
const nodemailer = require('nodemailer');

require('dotenv').config();

// Nodemailer setup
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

const transporter = nodemailer.createTransport({
    host: 'smtp.yourinstitution.edu.in', // Replace with your institution's SMTP server
    port: 587, // Use the appropriate port, 587 is common for TLS
    secure: false, // Set to true if you're using port 465 (SSL)
    auth: {
        user: "vishvkumar.b@ahduni.edu.in",
        pass: "VishvAU0407"
    },
    // If your institution requires a specific TLS configuration
    tls: {
        // Do not fail on invalid certs (use this if necessary)
        rejectUnauthorized: false,
    },
});

exports.contactUsEnroll =  async (req, res) => {
    const { name, email, message } = req.body;
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

    const mailOptionsAdmin = {
        from: "vishvkumar.b@ahduni.edu.in",
        to: 'vishvboda0407@gmail.com',
        subject: 'New Contact Us Submission',
        text: `You have a new contact form submission from website:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}\nDate: ${formattedDate}\nTime: ${formattedTime}`
    };

    const mailOptionsUser = {
        from: "vishvkumar.b@ahduni.edu.in",
        to: `${email}`,
        subject: 'Thank you for contacting IEEE AUSB!',
        html: contactUsUser(`${name}`) // Use the template function to set the HTML body
    };

    try {
        // Calculate the row count
        const rowCount = await ContactUsDetail.countDocuments() + 1;

        const newContact = new ContactUsDetail({ name, email, message, sentDate: formattedDate, sentTime: formattedTime, rowCount });
        await newContact.save();

        // Send email notification to Admin
        await transporter.sendMail(mailOptionsAdmin);
        console.log('Email sent to Admin');

        // Send email notification to User
        await transporter.sendMail(mailOptionsUser);
        console.log('Email sent to User');

        res.json({ message: 'Success' });
    } catch (err) {
        console.error('Error occurred:', err);
        if (err.code === 11000) {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(500).json({ message: 'Error occurred', error: err.message });
        }
    }
};

exports.getContactUs =  async (req, res) => {
    try {
        const contacts = await ContactUsDetail.find().select('name email message sentDate sentTime rowCount');
        res.json(contacts);
    } catch (err) {
        res.status(500).send('Error fetching updates data');
    }
};