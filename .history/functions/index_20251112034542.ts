// functions/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// =========================================================================
// 🚨 WARNING: INSECURE HARDCODING OF CREDENTIALS.
// If this is a real-world application, switch to Firebase CLI config immediately.
// =========================================================================

// --- HARDCODED EMAIL CREDENTIALS (REPLACE WITH YOUR ACTUAL VALUES) ---
const SENDER_EMAIL = 'pinlacnishia@gmail.com';
const SENDER_PASSWORD = 'pfamiummsxxhpsqx';
// ----------------------------------------------------------------------

// MUST CHANGE THIS URL: Update this to your actual application's login URL.
const WEB_APP_URL = 'https://YOUR-ACTUAL-APP-DOMAIN.com/login'; // <<< IMPORTANT: CHANGE THIS URL

// Initialize the Firebase Admin SDK
admin.initializeApp();

// Configure the email transporter using Nodemailer with hardcoded values
const transporter = nodemailer.createTransport({
    // Using Gmail requires you to use an App Password, not your regular account password.
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
        from: `IAIN Administration <${SENDER_EMAIL}>`, // Changed sender name
        to: email,
        subject: 'Welcome to IAIN - Your Account is Ready!',
        html: `
            <h1>Welcome to IAIN!</h1>
            <p>Your new account has been successfully created.</p>
            <p>Your login email is: <strong>${email}</strong></p>
            <p>Please click the link below to access the application and sign in:</p>
            <p><a href="${WEB_APP_URL}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #3b82f6; border-radius: 5px; text-decoration: none; margin-top: 10px;">Go to Login Page</a></p>
            <br>
            <p>Thank you!</p>
        `,
    };

    // 4. Send Email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email successfully sent to ${email}`);
        return { success: true, message: 'Welcome email sent successfully.' };
    } catch (error) {
        // Logging the full error is helpful for debugging Nodemailer/Gmail issues.
        console.error(`Error sending welcome email to ${email}:`, error);
        throw new functions.https.HttpsError('internal', 'Failed to send welcome email due to server error. Check function logs for details.', error);
    }
});