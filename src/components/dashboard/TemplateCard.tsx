
"use client";

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BarTemplate } from '@/lib/mockData';
import { Icons } from '@/components/icons';

interface TemplateCardProps {
  template: BarTemplate;
  onSelectTemplate: (template: BarTemplate) => void;
}

export function TemplateCard({ template, onSelectTemplate }: TemplateCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="aspect-[3/1] relative w-full">
          <Image
            src={template.previewImageUrl}
            alt={template.name} // Alt text can remain or be translated if needed for SEO in Persian
            fill // layout="fill" is deprecated, use fill
            style={{objectFit:"cover"}} // objectFit="cover" becomes style
            data-ai-hint="banner design"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.defaultConfig.message}
        </p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button className="w-full" onClick={() => onSelectTemplate(template)}>
          <Icons.Edit className="me-2 h-4 w-4" /> {/* Changed ml-2 to me-2 */}
          استفاده از قالب
        </Button>
      </CardFooter>
    </Card>
  );
}
