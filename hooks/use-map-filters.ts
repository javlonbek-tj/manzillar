import { useState, useEffect } from 'react';
import { getDistricts, getMahallas, getStreets, getStreetsByDistrict, getMavzes } from '@/lib/data';
import type { DistrictData, MahallaData, MavzeData } from '@/types/map';


export function useMapFilters() {
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [mahallas, setMahallas] = useState<MahallaData[]>([]);
  const [selectedMahalla, setSelectedMahalla] = useState<string>("");
  const [mavzes, setMavzes] = useState<MavzeData[]>([]);
  const [streets, setStreets] = useState<any[]>([]);
  const [selectedStreet, setSelectedStreet] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [showProperties, setShowProperties] = useState(true);
  const [showStreets, setShowStreets] = useState(true);
  const [showMahallas, setShowMahallas] = useState(true);
  const [showMavzes, setShowMavzes] = useState(true);
  const [showStreetLabels, setShowStreetLabels] = useState(true);
  const [showPropertyLabels, setShowPropertyLabels] = useState(true);
  const [showStreetPolygons, setShowStreetPolygons] = useState(true);
  
  useEffect(() => {
    if (selectedRegion) {
      setDistricts([]); // Clear immediately
      getDistricts(selectedRegion).then(setDistricts);
      setSelectedDistrict("");
      setMahallas([]);
      setMavzes([]);
      setSelectedMahalla("");
      setStreets([]);
      setSelectedStreet("");
    } else {
      setDistricts([]);
      setSelectedDistrict("");
      setMahallas([]);
      setMavzes([]);
      setSelectedMahalla("");
      setStreets([]);
      setSelectedStreet("");
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (selectedDistrict) {
      setMahallas([]); // Clear immediately
      setMavzes([]);  // Clear immediately
      setStreets([]);  // Clear immediately
      getMahallas(selectedDistrict).then(setMahallas);
      getMavzes(selectedDistrict).then(setMavzes);
      getStreetsByDistrict(selectedDistrict).then(setStreets);
      setSelectedMahalla("");
      setSelectedStreet("");
    } else {
      setMahallas([]);
      setMavzes([]);
      setSelectedMahalla("");
      setStreets([]);
      setSelectedStreet("");
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedMahalla) {
      // Just reset the selected street, but keep the'streets' list from the district level
      setSelectedStreet("");
    } else {
      setSelectedStreet("");
    }
  }, [selectedMahalla]);

  return {
    selectedRegion,
    setSelectedRegion,
    districts,
    selectedDistrict,
    setSelectedDistrict,
    mahallas,
    selectedMahalla,
    setSelectedMahalla,
    mavzes,
    streets,
    selectedStreet,
    setSelectedStreet,
    selectedProperty,
    setSelectedProperty,
    showProperties,
    setShowProperties,
    showStreets,
    setShowStreets,
    showMahallas,
    setShowMahallas,
    showMavzes,
    setShowMavzes,
    showStreetLabels,
    setShowStreetLabels,
    showPropertyLabels,
    setShowPropertyLabels,
    showStreetPolygons,
    setShowStreetPolygons,
  };
}
