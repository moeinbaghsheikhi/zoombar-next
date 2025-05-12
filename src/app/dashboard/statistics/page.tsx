
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { StatsDisplay } from '@/components/dashboard/StatsDisplay';
import { BarEditor } from '@/components/dashboard/BarEditor';
import { getUserBars, updateAnnouncementBar, deleteAnnouncementBar, type AnnouncementBar } from '@/lib/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useToast as useAppToast } from '@/hooks/use-toast'; // Renamed to avoid conflict
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription as UiCardDescription } from "@/components/ui/card"; // Renamed CardDescription
import { Textarea } from "@/components/ui/textarea"; // Changed Input to Textarea
import { Copy } from 'lucide-react';

// تابع تولید قطعه کد
function generateSnippet(barId: string, userId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002');
  
  return `
<script>
  (function() {
    fetch('${baseUrl}/api/get-announcement-bar?barId=${barId}&userId=${userId}')
      .then(function(response) {
        if (!response.ok) {
          throw new Error('پاسخ شبکه موفقیت آمیز نبود.');
        }
        return response.json();
      })
      .then(function(data) {
        if (data && data.message) {
          var bar = document.createElement('div');
          var barStyles = {
            backgroundColor: data.backgroundColor || '#f0f0f0',
            color: data.textColor || '#333333',
            textAlign: 'center',
            padding: '12px 15px',
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            zIndex: '9999',
            boxSizing: 'border-box',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'sans-serif' // یک فونت عمومی
          };
          for (var styleKey in barStyles) {
            bar.style[styleKey] = barStyles[styleKey];
          }
          
          var contentWrapper = document.createElement('div');
          contentWrapper.style.display = 'flex';
          contentWrapper.style.alignItems = 'center';
          contentWrapper.style.justifyContent = 'center';
          contentWrapper.style.gap = '10px'; // فاصله بین تصویر و متن

          if (data.imageUrl) {
            var img = document.createElement('img');
            var imgStyles = {
              height: '24px',
              width: 'auto',
              verticalAlign: 'middle'
            };
            for (var imgStyleKey in imgStyles) {
              img.style[imgStyleKey] = imgStyles[imgStyleKey];
            }
            img.src = data.imageUrl;
            img.alt = 'تصویر اعلان';
            contentWrapper.appendChild(img);
          }
          
          var textNode = document.createTextNode(data.message);
          contentWrapper.appendChild(textNode);
          bar.appendChild(contentWrapper);
          
          if (document.body) {
            document.body.insertBefore(bar, document.body.firstChild);
          } else {
            window.addEventListener('DOMContentLoaded', function() {
              document.body.insertBefore(bar, document.body.firstChild);
            });
          }
        }
      })
      .catch(function(error) {
        console.error('زوم‌بار لایت: خطا در دریافت نوار اعلانات:', error);
      });
  })();
</script>
  `.trim();
}


export default function StatisticsPage() {
  const { user } = useAuth();
  const { toast } = useAppToast(); // Use renamed hook
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
      const userBars = getUserBars(user.id);
      setBars(userBars);
      setIsLoadingBars(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBars();
  }, [fetchBars]);

  const handleEditBar = (bar: AnnouncementBar) => {
    setEditingBar(bar);
    setSelectedBarForSnippet(null); // Clear snippet when editing
    setSnippet(null);
  };

  const confirmDeleteBar = () => {
    if (!user || !deletingBarId) return;
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
                  این کد را کپی کرده و قبل از تگ پایانی <code>&lt;/body&gt;</code> در وب‌سایت خود جای‌گذاری کنید.
                </UiCardDescription>
              </div>
              <Button onClick={copySnippetToClipboard} variant="outline" size="sm" className="shrink-0">
                <Copy className="ms-2 h-4 w-4" /> {/* معکوس برای RTL */}
                کپی کردن کد
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              dir="ltr" // کد همیشه LTR است
              readOnly
              value={snippet}
              className="min-h-[200px] font-mono text-sm bg-muted/50 border rounded-md p-3 focus:ring-primary focus:border-primary"
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
          <AlertDialogContent>
            <AlertDialogHeader className="text-start">
              <AlertDialogTitle>تأیید حذف</AlertDialogTitle>
              <UiCardDescription>
                آیا از حذف این نوار اعلانات مطمئن هستید؟ این عمل قابل بازگشت نیست.
              </UiCardDescription>
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
