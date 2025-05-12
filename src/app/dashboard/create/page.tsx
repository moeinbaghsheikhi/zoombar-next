
"use client";

import React, { useState } from 'react';
import { BarEditor } from '@/components/dashboard/BarEditor';
import { TemplateCard } from '@/components/dashboard/TemplateCard';
import { barTemplates, createAnnouncementBar, type BarTemplate } from '@/lib/mockData'; // Mock data will also need translation
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export default function CreateBarPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<BarTemplate | undefined>(undefined);
  const [showEditor, setShowEditor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSelectTemplate = (template: BarTemplate) => {
    setSelectedTemplate(template);
    setShowEditor(true);
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(undefined); 
    setShowEditor(true);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setSelectedTemplate(undefined);
  };

  const handleSubmit = async (data: { title: string; message: string; backgroundColor: string; textColor: string; imageUrl?: string }) => {
    if (!user) {
      toast({ title: "خطا", description: "برای ایجاد نوار باید وارد شده باشید.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createAnnouncementBar(user.id, data); // Assuming createAnnouncementBar is async now
      toast({ title: "موفقیت!", description: `نوار اعلانات "${data.title}" ایجاد شد.` });
      router.push('/dashboard/statistics'); 
    } catch (error) {
      toast({ title: "خطا", description: "ایجاد نوار اعلانات ناموفق بود.", variant: "destructive" });
      console.error("Failed to create bar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showEditor) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{selectedTemplate ? `سفارشی‌سازی: ${selectedTemplate.name}` : 'ایجاد نوار اعلانات جدید'}</CardTitle>
          <CardDescription>
            {selectedTemplate ? 'جزئیات قالب انتخابی خود را تغییر دهید.' : 'نوار اعلانات خود را از ابتدا طراحی کنید.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarEditor
            template={selectedTemplate}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ایجاد نوار اعلانات جدید</h1>
        <p className="text-muted-foreground">یک قالب انتخاب کنید یا از ابتدا شروع کنید.</p>
      </div>

      <Button onClick={handleStartFromScratch} size="lg" variant="outline" className="mb-8">
        <Icons.Create className="me-2 h-5 w-5" /> {/* Changed ml-2 to me-2 */}
        شروع از ابتدا
      </Button>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">یا، یک قالب انتخاب کنید</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {barTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelectTemplate={handleSelectTemplate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
