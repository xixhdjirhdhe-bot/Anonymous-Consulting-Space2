// ไฟล์: api/notify.js
export default async function handler(req, res) {
    // 1. อนุญาตเฉพาะการส่งข้อมูลแบบ POST
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // 2. ตอบกลับสถานะ 200 ให้ LINE ทันที เพื่อให้ผ่านการ Verify และไม่ขึ้น Error 500
    res.status(200).send('OK');

    // 3. ดึงข้อมูลเหตุการณ์ (Events) ที่ LINE ส่งมา
    const events = req.body.events || [];
    if (events.length === 0) return;

    const event = events[0];
    
    // เช็กว่าเป็นข้อความตัวอักษรที่คนพิมพ์เข้ามาหรือไม่
    if (event.type === 'message' && event.message.type === 'text') {
        const replyToken = event.replyToken;
        const userMessage = event.message.text; // ข้อความที่ผู้ใช้พิมพ์มา

        // ตั้งค่าข้อความที่จะตอบกลับ (ตัวอย่าง: พิมพ์อะไรมา บอตจะตอบกลับคำเดิม)
        const replyText = `สภานักเรียนได้รับข้อความ "${userMessage}" เรียบร้อยแล้วค่ะ`;

        // ดึงค่า Channel Access Token จาก Environment Variables ของ Vercel
        const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

        try {
            // ส่งข้อความกลับไปหาผู้ใช้ผ่าน LINE API
            await fetch('https://api.line.me/v2/bot/message/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${channelAccessToken}`
                },
                body: JSON.stringify({
                    replyToken: replyToken,
                    messages: [{ type: 'text', text: replyText }]
                })
            });
        } catch (error) {
            console.error('Error replying to LINE:', error);
        }
    }
}
