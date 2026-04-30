export async function sendSlackNotification(webhookUrl: string, booking: any) {
  if (!webhookUrl) return;

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📅 New Booking Received!',
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Name:*\n${booking.booker_name}`,
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${booking.booker_email}`,
          },
        ],
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date(booking.start_time).toLocaleString()}`,
          },
        ],
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}
