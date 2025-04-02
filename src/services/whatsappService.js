const https = require('https');
require('dotenv').config();

const sendWhatsAppMessage = async (phone, message) => {
    return new Promise((resolve, reject) => {
        const formattedPhone = phone.replace('+', '').trim();
        const finalPhone = formattedPhone.startsWith('91') ? formattedPhone : `91${formattedPhone}`;

        const data = JSON.stringify({
            token: process.env.ULTRAMSG_API_TOKEN,
            to: finalPhone,
            body: message,
            priority: 1,  // Add priority
            referenceId: Date.now().toString()  // Add reference ID
        });

        const options = {
            hostname: 'api.ultramsg.com',
            path: `/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Accept': 'application/json'  // Add Accept header
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                // Always resolve as success unless there's a clear error
                console.log(`📨 Raw response for ${phone}:`, responseData);
                resolve({ status: 'sent', phone, timestamp: new Date() });
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Failed to send to ${phone}:`, error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

module.exports = sendWhatsAppMessage;
