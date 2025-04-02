const https = require('https');
require('dotenv').config();

module.exports = async function sendWhatsAppMessage (phone, message, retry = true)  {
    return new Promise((resolve, reject) => {
        let formattedPhone = phone.replace(/\D/g, '').trim();
        if (!formattedPhone.startsWith('91')) {
            formattedPhone = `91${formattedPhone}`;
        }

        const data = JSON.stringify({
            token: process.env.ULTRAMSG_API_TOKEN,
            to: formattedPhone,
            body: message,
            priority: 10,
            type: 'chat'
        });

        const apiUrl = new URL(process.env.ULTRAMSG_API_URL);

        const options = {
            hostname: apiUrl.hostname,
            path: apiUrl.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
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
                console.log(`📱 Attempting to send to ${formattedPhone}`);

                let jsonResponse;
                try {
                    jsonResponse = JSON.parse(responseData);
                } catch (e) {
                    console.log(`⚠️ Invalid JSON response for ${formattedPhone}:`, responseData);
                    return resolve({ success: false, phone: formattedPhone, error: 'Invalid JSON response' });
                }

                if (res.statusCode === 200 && !jsonResponse.error) {
                    console.log(`✅ Message sent to ${formattedPhone}`);
                    resolve({ success: true, phone: formattedPhone });
                } else {
                    console.log(`⚠️ API Error for ${formattedPhone}:`, jsonResponse.error || responseData);
                    if (retry) {
                        console.log(`🔄 Retrying for ${formattedPhone}...`);
                        return resolve(sendWhatsAppMessage(phone, message, false));
                    }
                    resolve({ success: false, phone: formattedPhone, error: jsonResponse.error || 'API Error' });
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Error sending to ${formattedPhone}:`, error.message);
            reject(error);
        });

        req.write(data);
        req.end();
    });
};
