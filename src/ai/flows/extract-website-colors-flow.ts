
'use server';
/**
 * @fileOverview AI flow to extract dominant colors from a website screenshot.
 *
 * - extractWebsiteColors - Function to get suggested background and text colors.
 * - ExtractColorsInput - Input type (image data URI).
 * - ExtractColorsOutput - Output type (background and text hex colors).
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod'; // Using zod directly as genkit might not re-export z for schema definition outside its direct API.

const ExtractColorsInputSchema = z.object({
  imageDataUri: z.string().describe(
    "A screenshot of a website, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ExtractColorsInput = z.infer<typeof ExtractColorsInputSchema>;

const ExtractColorsOutputSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر برای پس‌زمینه." }).describe("رنگ پس‌زمینه غالب پیشنهادی در فرمت هگز #RRGGBB."),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر برای متن." }).describe("رنگ متن با کنتراست مناسب پیشنهادی در فرمت هگز #RRGGBB."),
});
export type ExtractColorsOutput = z.infer<typeof ExtractColorsOutputSchema>;

export async function extractWebsiteColors(input: ExtractColorsInput): Promise<ExtractColorsOutput> {
  return extractWebsiteColorsFlow(input);
}

const extractColorsPrompt = ai.definePrompt({
  name: 'extractWebsiteColorsPrompt',
  input: {schema: ExtractColorsInputSchema},
  output: {schema: ExtractColorsOutputSchema},
  prompt: `شما یک دستیار متخصص طراحی وب هستید. وظیفه شما تجزیه و تحلیل تصویر ارائه شده از وب‌سایت و پیشنهاد یک طرح رنگی برای نوار اعلان است که با طراحی وب‌سایت هماهنگ باشد.

  تصویر را تجزیه و تحلیل کنید: {{media url=imageDataUri}}

  زیبایی‌شناسی کلی، الگوهای رنگی رایج و برندینگ قابل مشاهده در اسکرین‌شات را در نظر بگیرید.

  لطفاً ارائه دهید:
  ۱. یک رنگ پس‌زمینه غالب مناسب برای نوار اعلان. این رنگ در حالت ایده‌آل باید رنگی باشد که در محتوای اصلی وب‌سایت یا نواحی هدر/فوتر وجود دارد.
  ۲. یک رنگ متن که کنتراست بالایی با رنگ پس‌زمینه پیشنهادی داشته باشد تا از خوانایی اطمینان حاصل شود.

  رنگ‌ها را در فرمت هگزادسیمال #RRGGBB بازگردانید.
  مثال: اگر وب‌سایت دارای رنگ آبی و سفید زیادی است، ممکن است پس‌زمینه آبی و متن سفید را پیشنهاد دهید.
  `,
});

const extractWebsiteColorsFlow = ai.defineFlow(
  {
    name: 'extractWebsiteColorsFlow',
    inputSchema: ExtractColorsInputSchema,
    outputSchema: ExtractColorsOutputSchema,
  },
  async (input) => {
    const {output} = await extractColorsPrompt(input);
    if (!output) {
      throw new Error("هوش مصنوعی در استخراج رنگ‌ها ناموفق بود.");
    }
    // The schema validation in definePrompt output will handle regex automatically.
    return output;
  }
);
