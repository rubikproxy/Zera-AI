/**
 * @fileOverview Utility to send push notifications via Pushover.
 */

export async function sendPushoverNotification(message: string, title: string = '🚨 ZERA EMERGENCY ALERT') {
  const token = process.env.PUSHOVER_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;

  if (!token || !user) {
    console.warn('Pushover credentials (PUSHOVER_TOKEN or PUSHOVER_USER_KEY) not set in .env. Skipping notification.');
    return;
  }

  try {
    const response = await fetch('https://api.pushover.net/1/messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        user,
        message,
        title,
        priority: 2,    // Emergency priority: bypasses quiet hours and repeats
        retry: 60,      // Retry every 60 seconds until acknowledged
        expire: 3600,   // Expire after 1 hour
        sound: 'emergency'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pushover API error:', errorText);
    } else {
      console.log('Pushover emergency notification sent successfully.');
    }
  } catch (error) {
    console.error('Failed to send Pushover notification:', error);
  }
}
