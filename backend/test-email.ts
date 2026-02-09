
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const testEmail = async () => {
    console.log('Testing Email Configuration...');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const success = await transporter.verify();
        console.log('Server connection successful:', success);

        const info = await transporter.sendMail({
            from: `"Test Support" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, // Send to admin or self
            subject: 'Test Email from KyatFlow',
            text: 'If you receive this, your SMTP configuration is working correctly.',
            html: '<p>If you receive this, your SMTP configuration is working correctly.</p>',
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Email configuration is VALID.');
    } catch (error: any) {
        console.error('Error sending email:', error);
        console.error('Error Code:', error.code);
        console.error('Error Command:', error.command);
        console.error('Error Response:', error.response);
        console.log('Email configuration is INVALID.');
    }
};

testEmail();
