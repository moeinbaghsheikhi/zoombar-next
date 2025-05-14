
'use server';
/**
 * @fileOverview AI flow to extract dominant colors from a website screenshot
 * and suggest harmonious colors for the announcement bar and its timer.
 *
 * - extractWebsiteColors - Function to get suggested colors for bar and timer.
 * - ExtractColorsInput - Input type (image data URI).
 * - ExtractColorsOutput - Output type (background, text, timer background, and timer text hex colors).
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod'; 

const ExtractColorsInputSchema = z.object({
  imageDataUri: z.string().describe(
    "A screenshot of a website, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ExtractColorsInput = z.infer<typeof ExtractColorsInputSchema>;

const ExtractColorsOutputSchema = z.object({
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر برای پس‌زمینه نوار." }).describe("رنگ پس‌زمینه غالب پیشنهادی برای نوار اعلان در فرمت هگز #RRGGBB."),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر برای متن نوار." }).describe("رنگ متن با کنتراست مناسب پیشنهادی برای نوار اعلان در فرمت هگز #RRGGBB."),
  timerBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر برای پس‌زمینه تایمر." }).describe("رنگ پس‌زمینه پیشنهادی برای تایمر که با رنگ نوار هماهنگ باشد، در فرمت هگز #RRGGBB."),
  timerTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر برای متن تایمر." }).describe("رنگ متن با کنتراست مناسب پیشنهادی برای تایمر، در فرمت هگز #RRGGBB."),
});
export type ExtractColorsOutput = z.infer<typeof ExtractColorsOutputSchema>;

export async function extractWebsiteColors(input: ExtractColorsInput): Promise<ExtractColorsOutput> {
  return extractWebsiteColorsFlow(input);
}

const extractColorsPrompt = ai.definePrompt({
  name: 'extractWebsiteColorsPrompt',
  input: {schema: ExtractColorsInputSchema},
  output: {schema: ExtractColorsOutputSchema},
  prompt: `شما یک دستیار متخصص طراحی وب هستید. وظیفه شما تجزیه و تحلیل تصویر ارائه شده از وب‌سایت و پیشنهاد یک طرح رنگی کامل برای نوار اعلان و تایمر شمارش معکوس آن است که با طراحی وب‌سایت هماهنگ باشد و خوانایی بالایی داشته باشد.

  تصویر را تجزیه و تحلیل کنید: {{media url=imageDataUri}}

  زیبایی‌شناسی کلی، الگوهای رنگی رایج و برندینگ قابل مشاهده در اسکرین‌شات را در نظر بگیرید.

  لطفاً ارائه دهید:
  ۱. رنگ پس‌زمینه غالب مناسب برای نوار اعلان اصلی. این رنگ در حالت ایده‌آل باید از تم اصلی وب‌سایت الهام گرفته شود.
  ۲. رنگ متنی برای نوار اعلان اصلی که کنتراست بالایی با رنگ پس‌زمینه پیشنهادی نوار داشته باشد تا از خوانایی اطمینان حاصل شود.
  ۳. رنگ پس‌زمینه برای تایمر شمارش معکوس. این رنگ باید با رنگ پس‌زمینه نوار اعلان هماهنگ باشد، اما می‌تواند متفاوت باشد تا تایمر را برجسته کند (مثلاً یک رنگ تاکیدی از وب‌سایت).
  ۴. رنگ متنی برای تایمر شمارش معکوس که کنتراست بالایی با رنگ پس‌زمینه پیشنهادی تایمر داشته باشد.

  همه رنگ‌ها را در فرمت هگزادسیمال #RRGGBB بازگردانید.
  مثال: اگر وب‌سایت دارای رنگ آبی و سفید زیادی است و رنگ تاکیدی نارنجی دارد، ممکن است پیشنهاد دهید:
  - پس‌زمینه نوار: آبی
  - متن نوار: سفید
  - پس‌زمینه تایمر: نارنجی
  - متن تایمر: سفید یا مشکی (بسته به کنتراست با نارنجی)
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
    // Schema validation in definePrompt output handles regex automatically.
    // Ensure all four colors are present, even if AI somehow misses one.
    return {
        backgroundColor: output.backgroundColor || '#333333',
        textColor: output.textColor || '#FFFFFF',
        timerBackgroundColor: output.timerBackgroundColor || '#FC4C1D', // Default primary if not provided
        timerTextColor: output.timerTextColor || '#FFFFFF', // Default white if not provided
    };
  }
);
