'use client';

import { useState } from 'react';
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

interface UserAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regions: Region[];
  allDistricts: District[];
  onSuccess: () => void;
}

export function UserAddDialog({
  open,
  onOpenChange,
  regions,
  allDistricts,
  onSuccess,
}: UserAddDialogProps) {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'region' | 'district'>('region');
  const [formData, setFormData] = useState({
    fullName: '',
    jshshir: '',
    phoneNumber: '',
    position: 'assistant',
    status: 'active',
    regionId: '',
    districtId: '',
  });

  const availableDistricts = formData.regionId
    ? allDistricts.filter((d) => d.regionId === formData.regionId)
    : [];

  const handleSubmit = async () => {
    if (userType === 'region') {
      if (!formData.regionId || !formData.position) {
        alert('Iltimos, barcha majburiy maydonlarni to\'ldiring');
        return;
      }
      if (formData.status === 'active' && (!formData.fullName || !formData.jshshir || !formData.phoneNumber)) {
        alert('Faol xodim uchun barcha ma\'lumotlar talab qilinadi');
        return;
      }
    } else {
      if (!formData.districtId) {
        alert('Iltimos, tumanni tanlang');
        return;
      }
      if (formData.status === 'active' && (!formData.fullName || !formData.jshshir || !formData.phoneNumber)) {
        alert('Faol xodim uchun barcha ma\'lumotlar talab qilinadi');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      onSuccess();
      onOpenChange(false);
      setFormData({
        fullName: '',
        jshshir: '',
        phoneNumber: '',
        position: 'assistant',
        status: 'active',
        regionId: '',
        districtId: '',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>Yangi xodim qo'shish</DialogTitle>
          <DialogDescription className="sr-only">
            Yangi xodim ma'lumotlarini kiriting
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userType" className="text-right">
              Turi
            </Label>
            <Select
              value={userType}
              onValueChange={(value: 'region' | 'district') => setUserType(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Xodim turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="region">Viloyat xodimi</SelectItem>
                <SelectItem value="district">Tuman xodimi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="region" className="text-right">
              Viloyat
            </Label>
            <Select
              value={formData.regionId}
              onValueChange={(value) =>
                setFormData({ ...formData, regionId: value, districtId: '' })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Viloyatni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.nameUz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {userType === 'district' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="district" className="text-right">
                Tuman
              </Label>
              <Select
                value={formData.districtId}
                onValueChange={(value) => setFormData({ ...formData, districtId: value })}
                disabled={!formData.regionId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Tumanni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.nameUz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {userType === 'region' && (
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
              "Qo'shish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
