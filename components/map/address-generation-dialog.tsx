'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface AddressGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  polygonData: {
    id: string;
    nameUz: string;
    type: string;
  } | null;
  onGenerate: (options: {
    intervalMeters: number;
    offsetMeters: number;
    startNumber: number;
    reverseDirection: boolean;
  }) => Promise<void>;
}

export function AddressGenerationDialog({
  open,
  onOpenChange,
  polygonData,
  onGenerate
}: AddressGenerationDialogProps) {
  const [intervalMeters, setIntervalMeters] = useState(20);
  const [offsetMeters, setOffsetMeters] = useState(5);
  const [startNumber, setStartNumber] = useState(1);
  const [reverseDirection, setReverseDirection] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({
        intervalMeters,
        offsetMeters,
        startNumber,
        reverseDirection
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating addresses:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!polygonData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ko'cha raqamlarini yaratish</DialogTitle>
          <DialogDescription>
            {polygonData.nameUz} ko'chasi uchun avtomatik raqamlash tizimini yaratish
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="interval">
              Segment oralig'i (metr)
            </Label>
            <Input
              id="interval"
              type="number"
              value={intervalMeters}
              onChange={(e) => setIntervalMeters(Number(e.target.value))}
              min={10}
              max={50}
            />
            <p className="text-sm text-muted-foreground">
              Har bir raqam orasidagi masofa
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="offset">
              Chetga siljish (metr)
            </Label>
            <Input
              id="offset"
              type="number"
              value={offsetMeters}
              onChange={(e) => setOffsetMeters(Number(e.target.value))}
              min={2}
              max={10}
            />
            <p className="text-sm text-muted-foreground">
              Markaziy chiziqdan raqamlarning masofasi
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startNumber">
              Boshlang'ich raqam
            </Label>
            <Input
              id="startNumber"
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(Number(e.target.value))}
              min={1}
            />
            <p className="text-sm text-muted-foreground">
              Raqamlash qaysi raqamdan boshlansin
            </p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reverse"
                checked={reverseDirection}
                onCheckedChange={(checked) => setReverseDirection(checked as boolean)}
              />
              <Label htmlFor="reverse" className="cursor-pointer">
                Yo'nalishni teskari qilish
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Raqamlash qaysi tomondan boshlanishini o'zgartirish
            </p>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Raqamlash qoidasi:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Chap tomonda: toq raqamlar (1, 3, 5...)</li>
              <li>O'ng tomonda: juft raqamlar (2, 4, 6...)</li>
              <li>Oq markaziy chiziq ko'rsatiladi</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yaratilmoqda...
              </>
            ) : (
              'Raqamlashni yaratish'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
