const https = require('https');
require('dotenv').config();

const sendWhatsAppMessage = async (phone, message) => {
    return new Promise((resolve, reject) => {
        // Format phone number (remove any + and ensure starts with 91)
        const formattedPhone = phone.replace('+', '').trim();
        const finalPhone = formattedPhone.startsWith('91') ? formattedPhone : `91${formattedPhone}`;

        const data = JSON.stringify({
            token: process.env.ULTRAMSG_API_TOKEN,
            to: finalPhone,
            body: message
        });

        const options = {
            hostname: 'api.ultramsg.com',
            path: `/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    console.log("✅ WhatsApp Message Sent:", response);
                    resolve(response);
                } catch (error) {
                    console.error("❌ Error parsing response:", error);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error("❌ Error Sending WhatsApp Message:", error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

module.exports = sendWhatsAppMessage;
