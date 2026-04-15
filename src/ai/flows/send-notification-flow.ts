'use server';
/**
 * @fileOverview A Genkit flow that sends a notification by writing to Firestore.
 * This enables real-time notifications for both admins and customers.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase/init';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SendNotificationInputSchema = z.object({
  recipientId: z.string().describe('The UID of the user to receive the notification.'),
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
    // Import from /init to avoid client hook dependency errors on the server
    const { db } = initializeFirebase();
    
    await addDoc(collection(db, 'notifications'), {
      recipientId: input.recipientId,
      title: input.title,
      body: input.body,
      read: false,
      createdAt: serverTimestamp(),
    });

    console.log(`[Notification Queued] To UID: ${input.recipientId} | Title: ${input.title}`);
  }
);
