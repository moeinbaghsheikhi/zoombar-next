
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { StatsDisplay } from '@/components/dashboard/StatsDisplay';
import { BarEditor } from '@/components/dashboard/BarEditor';
import { getUserBars, updateAnnouncementBar, deleteAnnouncementBar, type AnnouncementBar } from '@/lib/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useToast as useAppToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // DialogDescription removed as UiCardDescription is used
import { Icons } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from 'lucide-react'; // For copy icon

// تابع تولید قطعه کد
function generateSnippet(barId: string, userId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002');
  // Ensure NEXT_PUBLIC_BASE_URL is set in your .env.local or environment variables for production
  // For example: NEXT_PUBLIC_BASE_URL=https://yourdomain.com

  return `
<script>
  (function() {
    var zoomBarScript = document.createElement('script');
    zoomBarScript.src = '${baseUrl}/api/load-bar-script?barId=${barId}&userId=${userId}';
    zoomBarScript.async = true;
    document.head.appendChild(zoomBarScript);
  })();
</script>
  `.trim();
}


export default function StatisticsPage() {
  const { user } = useAuth();
  const { toast } = useAppToast();
  const [bars, setBars] = useState<AnnouncementBar[]>([]);
  const [editingBar, setEditingBar] = useState<AnnouncementBar | null>(null);
  const [deletingBarId, setDeletingBarId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBars, setIsLoadingBars] = useState(true);
  const [selectedBarForSnippet, setSelectedBarForSnippet] = useState<AnnouncementBar | null>(null);
  const [snippet, setSnippet] = useState<string | null>(null);

  const fetchBars = useCallback(() => {
    if (user) {
      setIsLoadingBars(true);
      // Simulate API call delay
      setTimeout(() => {
        const userBarsData = getUserBars(user.id);
        setBars(userBarsData);
        setIsLoadingBars(false);
      }, 500);
    }
  }, [user]);

  useEffect(() => {
    fetchBars();
  }, [fetchBars]);

  const handleEditBar = (bar: AnnouncementBar) => {
    setEditingBar(bar);
    setSelectedBarForSnippet(null); 
    setSnippet(null);
  };

  const confirmDeleteBar = async () => {
    if (!user || !deletingBarId) return;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const success = deleteAnnouncementBar(user.id, deletingBarId);
    if (success) {
      toast({ title: "موفقیت", description: "نوار اعلانات حذف شد." });
      fetchBars(); 
      if (selectedBarForSnippet?.id === deletingBarId) {
        setSelectedBarForSnippet(null);
        setSnippet(null);
      }
    } else {
      toast({ title: "خطا", description: "حذف نوار اعلانات ناموفق بود.", variant: "destructive" });
    }
    setDeletingBarId(null);
  };

  const handleUpdateBar = async (data: { title: string; message: string; backgroundColor: string; textColor: string; imageUrl?: string }) => {
    if (!user || !editingBar) return;
    setIsSubmitting(true);
    const updatedData: AnnouncementBar = {
      ...editingBar,
      ...data,
    };
    try {
      await updateAnnouncementBar(user.id, updatedData); 
      toast({ title: "موفقیت", description: `نوار "${data.title}" به‌روزرسانی شد.` });
      setEditingBar(null);
      fetchBars(); 
    } catch (error) {
      toast({ title: "خطا", description: "به‌روزرسانی نوار اعلانات ناموفق بود.", variant: "destructive" });
      console.error("Failed to update bar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBarSelectForSnippet = useCallback((bar: AnnouncementBar) => {
    setSelectedBarForSnippet(bar);
    if (user && bar) {
      setSnippet(generateSnippet(bar.id, user.id));
    } else {
      setSnippet(null);
    }
  }, [user]);

  const copySnippetToClipboard = () => {
    if (snippet) {
      navigator.clipboard.writeText(snippet)
        .then(() => {
          toast({ title: "موفقیت", description: "قطعه کد در کلیپ‌بورد کپی شد." });
        })
        .catch(err => {
          toast({ title: "خطا", description: "کپی کردن قطعه کد ناموفق بود.", variant: "destructive" });
          console.error("کپی ناموفق: ", err);
        });
    }
  };

  if (isLoadingBars) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Icons.Spinner className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">آمار نوارهای اعلانات</h1>
        <p className="text-muted-foreground">عملکرد نوارهای اعلانات خود را پیگیری کنید و کد جاسازی را دریافت کنید.</p>
      </div>
      <StatsDisplay 
        bars={bars} 
        onEditBar={handleEditBar} 
        onDeleteBarRequest={(barId) => setDeletingBarId(barId)}
        onBarSelectForSnippet={handleBarSelectForSnippet} 
      />

      {selectedBarForSnippet && snippet && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-2">
              <div>
                <CardTitle>قطعه کد برای نوار: "{selectedBarForSnippet.title}"</CardTitle>
                <UiCardDescription className="mt-1">
                  این کد را کپی کرده و قبل از تگ پایانی <code>&lt;/body&gt;</code> یا داخل تگ <code>&lt;head&gt;</code> در وب‌سایت خود جای‌گذاری کنید.
                </UiCardDescription>
              </div>
              <Button onClick={copySnippetToClipboard} variant="outline" size="sm" className="shrink-0">
                <Copy className="me-2 h-4 w-4" /> {/* معکوس برای RTL */}
                کپی کردن کد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              dir="ltr" 
              readOnly
              value={snippet}
              className="min-h-[120px] font-mono text-sm bg-muted/50 border rounded-md p-3 focus:ring-primary focus:border-primary"
              onClick={(e: React.MouseEvent<HTMLTextAreaElement>) => (e.target as HTMLTextAreaElement).select()}
              aria-label="قطعه کد جاسازی"
            />
          </CardContent>
        </Card>
      )}


      {editingBar && (
        <Dialog open={!!editingBar} onOpenChange={(open) => !open && setEditingBar(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader className="text-start">
              <DialogTitle>ویرایش نوار اعلانات: {editingBar.title}</DialogTitle>
              <UiCardDescription>
                تغییرات را در پیکربندی نوار اعلانات خود اعمال کنید.
              </UiCardDescription>
            </DialogHeader>
            <div className="py-4">
              <BarEditor
                initialData={editingBar}
                onSubmit={handleUpdateBar}
                onCancel={() => setEditingBar(null)}
                isSubmitting={isSubmitting}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {deletingBarId && (
         <AlertDialog open={!!deletingBarId} onOpenChange={(open) => !open && setDeletingBarId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader className="text-start">
              <AlertDialogTitle>تأیید حذف</AlertDialogTitle>
              <AlertDialogDescription>
                آیا از حذف این نوار اعلانات مطمئن هستید؟ این عمل قابل بازگشت نیست.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingBarId(null)}>انصراف</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteBar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
