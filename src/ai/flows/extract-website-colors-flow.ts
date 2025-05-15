
'use server';
/**
 * @fileOverview AI flow to extract dominant colors from a website screenshot
 * and suggest harmonious colors for the announcement bar, its timer, and its CTA button.
 *
 * - extractWebsiteColors - Function to get suggested colors.
 * - ExtractColorsInput - Input type (image data URI).
 * - ExtractColorsOutput - Output type (bar background, bar text, timer background, timer text, CTA background, CTA text hex colors).
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
  ctaBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر برای پس‌زمینه دکمه CTA." }).describe("رنگ پس‌زمینه پیشنهادی برای دکمه CTA که چشم‌نواز و هماهنگ باشد، در فرمت هگز #RRGGBB."),
  ctaTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, { message: "کد رنگ هگز نامعتبر برای متن دکمه CTA." }).describe("رنگ متن با کنتراست مناسب پیشنهادی برای دکمه CTA، در فرمت هگز #RRGGBB."),
});
export type ExtractColorsOutput = z.infer<typeof ExtractColorsOutputSchema>;

export async function extractWebsiteColors(input: ExtractColorsInput): Promise<ExtractColorsOutput> {
  return extractWebsiteColorsFlow(input);
}

const extractColorsPrompt = ai.definePrompt({
  name: 'extractWebsiteColorsPrompt',
  input: {schema: ExtractColorsInputSchema},
  output: {schema: ExtractColorsOutputSchema},
  prompt: `شما یک طراح UI/UX خلاق و خوش‌سلیقه هستید. وظیفه شما تجزیه و تحلیل تصویر ارائه شده از وب‌سایت و پیشنهاد یک طرح رنگی کامل برای نوار اعلان، تایمر شمارش معکوس آن، و دکمه فراخوان (CTA) آن است که با طراحی وب‌سایت هماهنگ باشد و خوانایی بالایی داشته باشد.

  تصویر را تجزیه و تحلیل کنید: {{media url=imageDataUri}}

  زیبایی‌شناسی کلی، الگوهای رنگی رایج و برندینگ قابل مشاهده در اسکرین‌شات را در نظر بگیرید.

  لطفاً ارائه دهید:
  ۱. رنگ پس‌زمینه غالب مناسب برای نوار اعلان اصلی. این رنگ در حالت ایده‌آل باید از تم اصلی وب‌سایت الهام گرفته شود.
  ۲. رنگ متنی برای نوار اعلان اصلی که کنتراست بالایی با رنگ پس‌زمینه پیشنهادی نوار داشته باشد تا از خوانایی اطمینان حاصل شود.
  ۳. رنگ پس‌زمینه برای تایمر شمارش معکوس. این رنگ باید با رنگ پس‌زمینه نوار اعلان هماهنگ باشد، اما می‌تواند متفاوت باشد تا تایمر را برجسته کند (مثلاً یک رنگ تاکیدی از وب‌سایت).
  ۴. رنگ متنی برای تایمر شمارش معکوس که کنتراست بالایی با رنگ پس‌زمینه پیشنهادی تایمر داشته باشد.
  ۵. رنگ پس‌زمینه برای دکمه فراخوان (CTA). این رنگ باید با نوار و تایمر هماهنگ باشد و در عین حال چشم‌نواز باشد. می‌تواند یک رنگ تاکیدی تیره از پالت وب‌سایت باشد (مثلاً اگر وب‌سایت آبی است، یک آبی تیره برای پس‌زمینه دکمه CTA و متن سفید). یا می‌تواند با رنگ پس‌زمینه تایمر یکسان یا مکمل آن باشد.
  ۶. رنگ متنی برای دکمه فراخوان (CTA) که کنتراست بالایی با رنگ پس‌زمینه پیشنهادی دکمه CTA داشته باشد.

  همه رنگ‌ها را در فرمت هگزادسیمال #RRGGBB بازگردانید.
  مثال: اگر وب‌سایت دارای رنگ آبی و سفید زیادی است و رنگ تاکیدی نارنجی دارد، ممکن است پیشنهاد دهید:
  - پس‌زمینه نوار: آبی
  - متن نوار: سفید
  - پس‌زمینه تایمر: نارنجی
  - متن تایمر: سفید یا مشکی
  - پس‌زمینه CTA: آبی تیره یا نارنجی
  - متن CTA: سفید
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
    // Ensure all six colors are present, even if AI somehow misses one.
    return {
        backgroundColor: output.backgroundColor || '#333333',
        textColor: output.textColor || '#FFFFFF',
        timerBackgroundColor: output.timerBackgroundColor || '#FC4C1D', 
        timerTextColor: output.timerTextColor || '#FFFFFF', 
        ctaBackgroundColor: output.ctaBackgroundColor || '#000000', // Default to black for CTA
        ctaTextColor: output.ctaTextColor || '#FFFFFF', // Default to white for CTA text
    };
  }
);
