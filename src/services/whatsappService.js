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
            priority: 10,
            type: 'chat'
        });

        // Parse the API URL from env
        const apiUrl = new URL(`${process.env.ULTRAMSG_API_URL}/messages/chat`);

        const options = {
            hostname: apiUrl.hostname,
            path: apiUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Accept': 'application/json'
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log(`📱 Attempting to send to ${finalPhone}`);
                if (res.statusCode === 200) {
                    console.log(`✅ Message sent to ${finalPhone}`);
                    resolve({ success: true, phone: finalPhone });
                } else {
                    console.log(`⚠️ Response for ${finalPhone}:`, responseData);
                    resolve({ success: false, phone: finalPhone, error: 'API Error' });
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Error sending to ${finalPhone}:`, error.message);
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

module.exports = sendWhatsAppMessage;
