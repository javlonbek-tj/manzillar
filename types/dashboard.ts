export type Region = {
  id: string;
  nameUz: string;
  nameRu: string | null;
  code: string;
};

export type District = {
  id: string;
  nameUz: string;
  nameRu: string | null;
  code: string;
  regionId: string;
  region: { nameUz: string; code: string };
};

export type Mahalla = {
  id: string;
  nameUz: string;
  nameRu: string | null;
  code: string;
  uzKadName: string | null;
  geoCode: string | null;
  oneId: string | null;
  hidden: boolean;
  mergedIntoId: string | null;
  mergedIntoName: string | null;
  districtId: string;
  district: {
    nameUz: string;
    code: string;
    regionId: string;
    region: { 
      nameUz: string;
      code: string;
    };
  };
};

export type Street = {
  id: string;
  nameUz: string;
  nameRu: string | null;
  code: string;
  type: string;
  oldName: string | null;
  districtId: string;
  mahallaId: string;
  district: {
    nameUz: string;
    code: string;
    regionId: string;
    region: { 
      nameUz: string;
      code: string;
    };
  };
  mahalla: {
    nameUz: string;
  };
};

export type DashboardData = {
  regions: Region[];
  districts: District[];
  mahallas: Mahalla[];
  streets: Street[];
  addresses: Address[];
};

export type Address = {
  id: string;
  regionId: string | null;
  regionName: string | null;
  districtId: string | null;
  districtName: string | null;
  mahallaId: string | null;
  mahallaName: string | null;
  streetId: string | null;
  streetName: string | null;
  houseNumber: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TabType = 'regions' | 'districts' | 'mahallas' | 'streets' | 'addresses';

export type DashboardItem = Region | District | Mahalla | Street | Address;
