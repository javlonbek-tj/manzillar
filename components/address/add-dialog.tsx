'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, Eye, Loader2, FileText, ChevronDown } from 'lucide-react';
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
import type { TabType, Region, District } from '@/types/dashboard';

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: TabType;
  regions?: Region[];
  districts?: District[];
  selectedRegion?: string;
  onSuccess: () => void;
}

export function AddDialog({
  open,
  onOpenChange,
  activeTab,
  regions = [],
  districts = [],
  selectedRegion,
  onSuccess,
}: AddDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameUz: '',
    nameRu: '',
    code: '',
    regionId: selectedRegion || '',
    districtId: '',
    uzKadName: '',
    geoCode: '',
    oneId: '',
    hidden: false,
    mergedIntoId: '',
    mergedIntoName: '',
    regulationUrl: '',
    regulationFileName: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [existingFiles, setExistingFiles] = useState<Array<{ name: string; url: string }>>([]);
  const [showExistingFiles, setShowExistingFiles] = useState(false);
  const sessionUploadedUrls = useRef<string[]>([]);

  const currentRegion = regions.find(r => r.id === formData.regionId);
  const regionName = currentRegion?.nameUz || 'General';

  useEffect(() => {
    const fetchExistingFiles = async () => {
      if (!formData.regionId) return;
      try {
        const res = await fetch(`/api/upload?regionName=${encodeURIComponent(regionName)}`);
        if (res.ok) {
          const data = await res.json();
          setExistingFiles(data.files || []);
        }
      } catch (err) {
        console.error('Error fetching existing files:', err);
      }
    };

    if (open && formData.regionId) {
      fetchExistingFiles();
    }
  }, [open, formData.regionId, regionName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('regionName', regionName);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      
      // If we already had a session upload, delete it before replacing
      if (formData.regulationUrl && sessionUploadedUrls.current.includes(formData.regulationUrl)) {
        try {
          await fetch(`/api/upload?url=${encodeURIComponent(formData.regulationUrl)}`, { method: 'DELETE' });
          sessionUploadedUrls.current = sessionUploadedUrls.current.filter(u => u !== formData.regulationUrl);
        } catch (err) {
          console.error('Failed to cleanup replaced file:', err);
        }
      }

      setFormData((prev) => ({ 
        ...prev, 
        regulationUrl: data.url,
        regulationFileName: file.name
      }));
      
      // Track this URL for cleanup if not saved
      sessionUploadedUrls.current.push(data.url);
      
      // Update existing files list after upload
      setExistingFiles(prev => {
        if (prev.some(f => f.name === file.name)) return prev;
        return [...prev, { name: file.name, url: data.url }];
      });
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Fayl yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
    }
  };

  const cleanupUnusedFiles = async (savedUrl?: string) => {
    const urlsToDelete = sessionUploadedUrls.current.filter(url => url !== savedUrl);
    if (urlsToDelete.length === 0) return;

    for (const url of urlsToDelete) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete abandoned file:', url, err);
      }
    }
    sessionUploadedUrls.current = [];
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      cleanupUnusedFiles();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let url = '';
      let body: any = {};

      switch (activeTab) {
        case 'regions':
          url = '/api/regions';
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
          };
          break;
        case 'districts':
          url = '/api/districts';
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
            regionId: formData.regionId,
          };
          break;
        case 'mahallas':
          url = '/api/mahallas';
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
            districtId: formData.districtId,
            uzKadName: formData.uzKadName || null,
            geoCode: formData.geoCode || null,
            oneId: formData.oneId || null,
            hidden: formData.hidden,
            mergedIntoId: formData.mergedIntoId || null,
            mergedIntoName: formData.mergedIntoName || null,
            regulationUrl: formData.regulationUrl || null,
          };
          break;
        case 'streets':
          url = '/api/streets';
          body = {
            nameUz: formData.nameUz,
            nameRu: formData.nameRu || null,
            code: formData.code,
            districtId: formData.districtId,
          };
          break;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to create');
      }

      await cleanupUnusedFiles(formData.regulationUrl);

      onSuccess();
      onOpenChange(false);
      setFormData({
        nameUz: '',
        nameRu: '',
        code: '',
        regionId: selectedRegion || '',
        districtId: '',
        uzKadName: '',
        geoCode: '',
        oneId: '',
        hidden: false,
        mergedIntoId: '',
        mergedIntoName: '',
        regulationUrl: '',
        regulationFileName: '',
      });
      sessionUploadedUrls.current = [];
    } catch (error) {
      console.error('Error creating:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'regions':
        return "Hudud qo'shish";
      case 'districts':
        return "Tuman qo'shish";
      case 'mahallas':
        return "Mahalla qo'shish";
      case 'streets':
        return "Ko'cha qo'shish";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription className='sr-only'>
            Yangi ma'lumot qo'shish uchun formani to'ldiring
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          {/* First row: Nomi (O'zbekcha) and Nomi (Ruscha) */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='nameUz'>Nomi (O'zbekcha) *</Label>
              <Input
                id='nameUz'
                value={formData.nameUz}
                onChange={(e) =>
                  setFormData({ ...formData, nameUz: e.target.value })
                }
                required
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nameRu'>Nomi (Ruscha)</Label>
              <Input
                id='nameRu'
                value={formData.nameRu}
                onChange={(e) =>
                  setFormData({ ...formData, nameRu: e.target.value })
                }
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Second row: Soato kodi and Viloyat (if needed) */}
          {activeTab === 'regions' ? (
            <div className='space-y-2'>
              <Label htmlFor='code'>Soato kodi *</Label>
              <Input
                id='code'
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='code'>Soato kodi *</Label>
                <Input
                  id='code'
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='regionId'>Viloyat *</Label>
                <Select
                  value={formData.regionId}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      regionId: value,
                      districtId: '',
                    })
                  }
                >
                  <SelectTrigger id="regionId">
                    <SelectValue placeholder="Viloyat tanlang" />
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
            </div>
          )}

          {/* Mahalla-specific fields in two columns */}
          {activeTab === 'mahallas' && (
            <>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='districtId'>Tuman *</Label>
                  <Select
                    value={formData.districtId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, districtId: value })
                    }
                    disabled={!formData.regionId}
                  >
                    <SelectTrigger id="districtId">
                      <SelectValue placeholder="Tuman tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts
                        .filter((d) => d.regionId === formData.regionId)
                        .map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.nameUz}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='uzKadName'>UzKad nomi</Label>
                  <Input
                    id='uzKadName'
                    value={formData.uzKadName}
                    onChange={(e) =>
                      setFormData({ ...formData, uzKadName: e.target.value })
                    }
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='geoCode'>APU kodi</Label>
                  <Input
                    id='geoCode'
                    value={formData.geoCode}
                    onChange={(e) =>
                      setFormData({ ...formData, geoCode: e.target.value })
                    }
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='oneId'>1C kodi</Label>
                  <Input
                    id='oneId'
                    value={formData.oneId}
                    onChange={(e) =>
                      setFormData({ ...formData, oneId: e.target.value })
                    }
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className='space-y-2 flex items-end'>
                <Label htmlFor='hidden' className='flex items-center gap-2'>
                  <input
                    id='hidden'
                    type='checkbox'
                    checked={formData.hidden}
                    onChange={(e) =>
                      setFormData({ ...formData, hidden: e.target.checked })
                    }
                    className='w-4 h-4'
                  />
                  Optimallashgan
                </Label>
              </div>

              {formData.hidden && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='mergedIntoId'>
                      Birlashtiruvchi mahalla ID
                    </Label>
                    <Input
                      id='mergedIntoId'
                      value={formData.mergedIntoId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mergedIntoId: e.target.value,
                        })
                      }
                      placeholder='ID'
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='mergedIntoName'>
                      Birlashtiruvchi mahalla nomi
                    </Label>
                    <Input
                      id='mergedIntoName'
                      value={formData.mergedIntoName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mergedIntoName: e.target.value,
                        })
                      }
                      placeholder='Nomi'
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {formData.hidden && (
                <div className='space-y-4 py-2 border-t dark:border-gray-700 mt-2'>
                  <div className="flex items-center justify-between">
                    <Label htmlFor='add-regulation-file' className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Qaror (PDF yoki Rasm)
                    </Label>
                    
                    {existingFiles.length > 0 && !formData.regulationUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setShowExistingFiles(!showExistingFiles)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Mavjud hujjatni tanlash
                        <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showExistingFiles ? 'rotate-180' : ''}`} />
                      </Button>
                    )}
                  </div>

                  {showExistingFiles && !formData.regulationUrl && existingFiles.length > 0 && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                      <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">
                        {regionName} hududi uchun yuklangan hujjatlar:
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {existingFiles.map((file, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, regulationUrl: file.url, regulationFileName: file.name }));
                              setShowExistingFiles(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="text-xs truncate text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                                {file.name}
                              </span>
                            </div>
                            <Check className="w-3.5 h-3.5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="relative group">
                    <input
                      ref={fileInputRef}
                      id='add-regulation-file'
                      type='file'
                      accept='.pdf,image/*'
                      onChange={handleFileUpload}
                      className='hidden'
                      disabled={uploading}
                    />
                    
                    <div 
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`
                        flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer
                        ${formData.regulationUrl 
                          ? 'border-green-500/50 bg-green-500/5 dark:bg-green-500/10' 
                          : 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5 hover:border-blue-500/50'
                        }
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                          <span className="text-sm font-medium text-blue-600">Fayl yuklanmoqda...</span>
                        </div>
                      ) : formData.regulationUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-600" />
                          </div>
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400 text-center">
                            Hujjat tanlandi/yuklandi
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-xs px-4">
                            {formData.regulationFileName || formData.regulationUrl.split('/').pop()}
                          </span>
                          <div className="flex gap-3 mt-2">
                             <a 
                              href={formData.regulationUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ko'rish
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData(prev => ({ ...prev, regulationUrl: '', regulationFileName: '' }));
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              O'chirish
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <Upload className="w-6 h-6 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center px-4">
                            Faylni yuklash uchun bosing yoki sudrab keling
                          </span>
                          <p className="text-[10px] text-muted-foreground px-6 text-center">
                            Fayllar <span className="font-bold text-blue-500">{regionName}</span> papkasida saqlanadi
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tuman field for streets */}
          {activeTab === 'streets' && (
            <div className='space-y-2'>
              <Label htmlFor='districtId'>Tuman *</Label>
              <Select
                value={formData.districtId}
                onValueChange={(value) =>
                  setFormData({ ...formData, districtId: value })
                }
                disabled={!formData.regionId}
              >
                <SelectTrigger id="districtId">
                  <SelectValue placeholder="Tuman tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {districts
                    .filter((d) => d.regionId === formData.regionId)
                    .map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.nameUz}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="cursor-pointer">
            {loading ? 'Saqlanmoqda...' : "Qo'shish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
