
'use server';
/**
 * @fileOverview A Genkit flow that simulates sending a push notification.
 * In a production environment, this would call the FCM REST API.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendNotificationInputSchema = z.object({
  recipientToken: z.string().describe('The FCM token of the recipient device.'),
  title: z.string().describe('The notification title.'),
  body: z.string().describe('The notification message body.'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

export async function sendPushNotification(input: SendNotificationInput): Promise<void> {
  return sendNotificationFlow(input);
}

const sendNotificationFlow = ai.defineFlow(
  {
    name: 'sendNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    console.log(`[Push Notification] To: ${input.recipientToken} | Title: ${input.title} | Body: ${input.body}`);
    
    // In a real scenario, you'd use fetch() to call FCM v1 API here.
    // This requires an OAuth2 access token which is usually handled by Firebase Admin SDK.
    // For this prototype, we log the action. 
  }
);
