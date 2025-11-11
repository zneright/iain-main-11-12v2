// functions/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Load the secure configuration
const mailConfig = functions.config().mail;

// Set your web application's login URL
const WEB_APP_URL = 'https://your-app-domain.com/login';

// Configure the email transporter
const transporter = nodemailer.createTransport({
    // IMPORTANT: Replace 'Gmail' if you use a different service (like SendGrid, Mailgun)
    service: 'Gmail',
    auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
    },
});

/**
 * HTTPS Callable function to send the welcome email.
 * This function is called by the client *after* the user is created.
 */
export const sendWelcomeEmail = functions.https.onCall(async (data, context) => {
    // SECURITY CHECK: Only allow authenticated users to call this (i.e., someone who just signed up)
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The request must be authenticated.');
    }

    const { email } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'The email field is required.');
    }

    // Email content (Securely excludes the password)
    const mailOptions = {
        from: `Your Application <${mailConfig.user}>`, // Use your configured sender email
        to: email,
        subject: 'Welcome to Your Application - Account Details',
        html: `
            <h1>Welcome!</h1>
            <p>Your account has been successfully created.</p>
            <p>Your login email is: <strong>${email}</strong></p>
            <p>You can log in to the web application here:</p>
            <p><a href="${WEB_APP_URL}">Click here to log in</a></p>
            <br>
            <p>Thank you for joining us!</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
        return { success: true, message: 'Welcome email sent.' };
    } catch (error) {
        console.error(`Error sending welcome email to ${email}:`, error);
        // Throw an internal error so the client knows the email failed, but the account is created.
        throw new functions.https.HttpsError('internal', 'Failed to send welcome email.', error);
    }
});