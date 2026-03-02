/**
 * @fileOverview Utility to send push notifications via Pushover for emergency escalation.
 */

export async function sendPushoverNotification(message: string, title: string = '🚨 ZERA EMERGENCY ALERT') {
  const token = process.env.PUSHOVER_TOKEN;
  const user = process.env.PUSHOVER_USER_KEY;

  if (!token || !user) {
    console.log('\n---------------------------------------------------------');
    console.log('🔥 SIMULATED EMERGENCY NOTIFICATION 🔥');
    console.log(`TITLE: ${title}`);
    console.log(`MESSAGE: ${message}`);
    console.log('STATUS: Skipped (Pushover keys not set in .env)');
    console.log('---------------------------------------------------------\n');
    return;
  }

  console.log(`[Pushover] Attempting to send emergency notification: "${title}"`);

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
      console.error('[Pushover] API error:', errorText);
    } else {
      console.log('[Pushover] Emergency notification sent successfully to external devices.');
    }
  } catch (error) {
    console.error('[Pushover] Failed to dispatch notification:', error);
  }
}
