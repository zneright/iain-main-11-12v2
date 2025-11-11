// functions/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// =========================================================================
// 🚨 WARNING: INSECURE HARDCODING OF CREDENTIALS. USE FIREBASE CLI CONFIG IN PRODUCTION!
// =========================================================================

// --- HARDCODED EMAIL CREDENTIALS (REPLACE WITH YOUR ACTUAL VALUES) ---
const SENDER_EMAIL = 'pinlacnishia@gmail.com';
const SENDER_PASSWORD = 'pfam iumm sxxhpsqx'; // e.g., Gmail App Password
// ----------------------------------------------------------------------

// Set your web application's login URL
const WEB_APP_URL = 'https://your-app-domain.com/login'; // <<< CHANGE THIS URL

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Configure the email transporter using Nodemailer with hardcoded values
const transporter = nodemailer.createTransport({
    // Replace 'Gmail' if you use a different service (like SendGrid, Mailgun, etc.)
    service: 'Gmail',
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
    },
});

/**
 * HTTPS Callable function to send the welcome email.
 */
export const sendWelcomeEmail = functions.https.onCall(async (data, context) => {
    // 1. SECURITY CHECK: Ensure the request is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The request must be authenticated.');
    }

    const { email } = data;

    // 2. Input Validation
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'The email field is required in the request data.');
    }

    // 3. Email Content (Excludes password for security)
    const mailOptions = {
        from: `Your Application <${SENDER_EMAIL}>`, // Use the hardcoded sender email
        to: email,
        subject: 'Welcome to Your Application - Account Created!',
        html: `
            <h1>Welcome!</h1>
            <p>Your login email is: <strong>${email}</strong></p>
            <p>You can now log in to the web application here:</p>
            <p><a href="${WEB_APP_URL}">Click here to log in</a></p>
            <br>
            <p>Thank you for joining us!</p>
        `,
    };

    // 4. Send Email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email successfully sent to ${email}`);
        return { success: true, message: 'Welcome email sent successfully.' };
    } catch (error) {
        console.error(`Error sending welcome email to ${email}:`, error);
        throw new functions.https.HttpsError('internal', 'Failed to send welcome email due to server error.', error);
    }
});