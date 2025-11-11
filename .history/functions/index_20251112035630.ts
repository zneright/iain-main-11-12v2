// functions/index.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
const SENDER_EMAIL = 'pinlacnishia@gmail.com';
const SENDER_PASSWORD = 'pfamiummsxxhpsqx';
const WEB_APP_URL = 'https://your-app-domain.com/login';
admin.initializeApp();
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
    },
});
export const sendWelcomeEmail = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The request must be authenticated.');
    }
    const { email } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'The email field is required in the request data.');
    }
    const mailOptions = {
        from: `Your Application <${SENDER_EMAIL}>`,
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
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email successfully sent to ${email}`);
        return { success: true, message: 'Welcome email sent successfully.' };
    } catch (error) {
        console.error(`Error sending welcome email to ${email}:`, error);
        throw new functions.https.HttpsError('internal', 'Failed to send welcome email due to server error.', error);
    }
});