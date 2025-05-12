
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { StatsDisplay } from '@/components/dashboard/StatsDisplay';
import { BarEditor } from '@/components/dashboard/BarEditor';
import { getUserBars, updateAnnouncementBar, deleteAnnouncementBar, type AnnouncementBar } from '@/lib/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';


export default function StatisticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bars, setBars] = useState<AnnouncementBar[]>([]);
  const [editingBar, setEditingBar] = useState<AnnouncementBar | null>(null);
  const [deletingBarId, setDeletingBarId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBars, setIsLoadingBars] = useState(true);

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
  };

  const confirmDeleteBar = () => {
    if (!user || !deletingBarId) return;
    const success = deleteAnnouncementBar(user.id, deletingBarId);
    if (success) {
      toast({ title: "موفقیت", description: "نوار اعلانات حذف شد." });
      fetchBars(); 
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
      await updateAnnouncementBar(user.id, updatedData); // Assuming async
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
        <p className="text-muted-foreground">عملکرد نوارهای اعلانات خود را پیگیری کنید.</p>
      </div>
      <StatsDisplay bars={bars} onEditBar={handleEditBar} onDeleteBarRequest={(barId) => setDeletingBarId(barId)} />

      {editingBar && (
        <Dialog open={!!editingBar} onOpenChange={(open) => !open && setEditingBar(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader className="text-start">
              <DialogTitle>ویرایش نوار اعلانات: {editingBar.title}</DialogTitle>
              <DialogDescription>
                تغییرات را در پیکربندی نوار اعلانات خود اعمال کنید.
              </DialogDescription>
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
