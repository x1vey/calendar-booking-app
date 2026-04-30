export async function sendWhatsAppMessage({ accountSid, authToken, fromNumber, to, templateBody }: {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  to: string;
  templateBody: string;
}) {
  if (!accountSid || !authToken || !fromNumber || !to) return;

  const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'From': `whatsapp:${fromNumber}`,
        'To': `whatsapp:${to}`,
        'Body': templateBody,
      }),
    });

    if (!response.ok) {
      console.error('Twilio Error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}
