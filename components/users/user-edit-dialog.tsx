'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Region {
  id: string;
  nameUz: string;
}

interface District {
  id: string;
  nameUz: string;
  regionId: string;
}

interface User {
  id: string;
  fullName: string;
  jshshir: string;
  phoneNumber: string;
  position: string;
  status: string;
  location: string;
  locationCode: string;
  region?: string;
  userType: 'region' | 'district';
}

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  regions: Region[];
  allDistricts: District[];
  onSuccess: () => void;
}

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  regions,
  allDistricts,
  onSuccess,
}: UserEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    jshshir: '',
    phoneNumber: '',
    position: '',
    status: '',
    regionId: '',
    districtId: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName === '-' ? '' : user.fullName,
        jshshir: user.jshshir === '-' ? '' : user.jshshir,
        phoneNumber: user.phoneNumber === '-' ? '' : user.phoneNumber,
        position: user.position === '-' ? '' : (user.position === 'Sho\'ba boshligi' ? 'boss' : 'assistant'),
        status: user.status,
        regionId: regions.find(r => r.nameUz === user.region)?.id || '',
        districtId: user.userType === 'district' ? allDistricts.find(d => d.nameUz === user.location)?.id || '' : '',
      });
    }
  }, [user, regions, allDistricts]);

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          id: user.id,
          userType: user.userType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>Xodim ma'lumotlarini tahrirlash</DialogTitle>
          <DialogDescription className="sr-only">
            Xodim ma'lumotlarini o'zgartiring
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4 text-xs">
            <span className="text-right text-gray-500 uppercase font-bold">Turi</span>
            <span className="col-span-3 font-semibold">
              {user.userType === 'region' ? 'Viloyat xodimi' : 'Tuman xodimi'}
            </span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4 text-xs">
            <span className="text-right text-gray-500 uppercase font-bold">Hudud</span>
            <span className="col-span-3 font-semibold">
              {user.region} {user.userType === 'district' ? ` / ${user.location}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Holat
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                const updates: any = { status: value };
                if (value === 'vacant') {
                  updates.fullName = '';
                  updates.jshshir = '';
                  updates.phoneNumber = '';
                }
                setFormData({ ...formData, ...updates });
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Holatni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Faol</SelectItem>
                <SelectItem value="vacant">Bo'sh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {user.userType === 'region' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Lavozim
              </Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Lavozimni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boss">Sho'ba boshlig'i</SelectItem>
                  <SelectItem value="assistant">Sho'ba bosh mutaxassisi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              F.I.O
            </Label>
            <Input
              id="fullName"
              className="col-span-3"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder={formData.status === 'vacant' ? '-' : ''}
              disabled={formData.status === 'vacant'}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jshshir" className="text-right">
              JSHSHIR
            </Label>
            <Input
              id="jshshir"
              className="col-span-3"
              value={formData.jshshir}
              onChange={(e) => setFormData({ ...formData, jshshir: e.target.value })}
              maxLength={14}
              disabled={formData.status === 'vacant'}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right">
              Telefon
            </Label>
            <Input
              id="phoneNumber"
              className="col-span-3"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+998"
              disabled={formData.status === 'vacant'}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saqlanmoqda
              </>
            ) : (
              "Saqlash"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
