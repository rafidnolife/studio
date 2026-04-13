'use server';
/**
 * @fileOverview A Genkit flow that generates an encoded WhatsApp message URL
 * for placing a product order.
 *
 * - generateWhatsappOrderMessage - A function that handles the WhatsApp message generation process.
 * - GenerateWhatsappOrderMessageInput - The input type for the generateWhatsappOrderMessage function.
 * - GenerateWhatsappOrderMessageOutput - The return type for the generateWhatsappOrderMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWhatsappOrderMessageInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productPrice: z.number().describe('The price of the product.'),
  quantity: z.number().int().positive().default(1).describe('The quantity of the product to order.'),
});
export type GenerateWhatsappOrderMessageInput = z.infer<typeof GenerateWhatsappOrderMessageInputSchema>;

const GenerateWhatsappOrderMessageOutputSchema = z.string().url().describe('The encoded WhatsApp message URL.');
export type GenerateWhatsappOrderMessageOutput = z.infer<typeof GenerateWhatsappOrderMessageOutputSchema>;

export async function generateWhatsappOrderMessage(input: GenerateWhatsappOrderMessageInput): Promise<GenerateWhatsappOrderMessageOutput> {
  return generateWhatsappOrderMessageFlow(input);
}

const generateWhatsappOrderMessageFlow = ai.defineFlow(
  {
    name: 'generateWhatsappOrderMessageFlow',
    inputSchema: GenerateWhatsappOrderMessageInputSchema,
    outputSchema: GenerateWhatsappOrderMessageOutputSchema,
  },
  async (input) => {
    const { productName, productPrice, quantity } = input;

    const adminPhoneNumber = '01797958686'; // Admin's WhatsApp phone number

    // Construct the Bangla message
    const message = `আমি এই পণ্যটি অর্ডার করতে চাই:\nপণ্যের নাম: ${productName}\nপরিমাণ: ${quantity}\nমূল্য: ${productPrice} টাকা`;

    // Encode the message for a URL
    const encodedMessage = encodeURIComponent(message);

    // Construct the final WhatsApp URL
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodedMessage}`;

    return whatsappUrl;
  }
);
