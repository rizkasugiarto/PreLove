import { useState, useEffect } from 'react';

// Fallback data in case the API is blocked or offline
const FALLBACK_REGIONS: Record<string, Record<string, string[]>> = {
  'DKI Jakarta': {
    'Kota Jakarta Selatan': ['Kebayoran Baru', 'Tebet', 'Cilandak', 'Pasar Minggu', 'Pancoran', 'Setiabudi', 'Mampang Prapatan'],
    'Kota Jakarta Pusat': ['Menteng', 'Tanah Abang', 'Sawah Besar', 'Kemayoran'],
    'Kota Jakarta Barat': ['Kebon Jeruk', 'Grogol Petamburan', 'Cengkareng'],
    'Kota Jakarta Timur': ['Jatinegara', 'Duren Sawit', 'Cakung'],
    'Kota Jakarta Utara': ['Kelapa Gading', 'Penjaringan', 'Tanjung Priok'],
  },
  'Jawa Barat': {
    'Kota Bandung': ['Pasteur', 'Dago', 'Cidadap', 'Coblong'],
    'Kab. Bandung': ['Baleendah', 'Dayeuhkolot', 'Bojongsoang', 'Soreang'],
    'Kota Bogor': ['Bogor Tengah', 'Bogor Timur', 'Bogor Utara', 'Bogor Selatan', 'Bogor Barat', 'Tanah Sareal'],
    'Kota Depok': ['Margonda', 'Cimanggis', 'Sawangan', 'Beji', 'Pancoran Mas', 'Sukmajaya', 'Tapos'],
    'Kota Bekasi': ['Bekasi Barat', 'Bekasi Timur', 'Bekasi Selatan', 'Bekasi Utara', 'Jatiasih', 'Pondokgede', 'Rawalumbu'],
  },
  'Jawa Tengah': {
    'Kota Semarang': ['Semarang Barat', 'Semarang Timur', 'Semarang Selatan', 'Tembalang'],
    'Kota Surakarta': ['Laweyan', 'Serengan', 'Pasar Kliwon', 'Jebres'],
  },
  'Jawa Timur': {
    'Kota Surabaya': ['Gubeng', 'Tegalsari', 'Wiyung', 'Wonokromo', 'Rungkut'],
    'Kota Malang': ['Blimbing', 'Klojen', 'Lowokwaru', 'Sukun'],
  },
  'Banten': {
    'Kota Tangerang': ['Batuceper', 'Benda', 'Ciledug', 'Cipondoh'],
    'Kota Tangerang Selatan': ['Serpong', 'Pamulang', 'Ciputat', 'Pondok Aren'],
  },
  'DI Yogyakarta': {
    'Kota Yogyakarta': ['Danurejan', 'Gedongtengen', 'Gondokusuman', 'Jetis'],
    'Kab. Sleman': ['Depok', 'Gamping', 'Mlati', 'Ngaglik'],
  },
  'Bali': {
    'Kota Denpasar': ['Denpasar Barat', 'Denpasar Selatan', 'Denpasar Timur', 'Denpasar Utara'],
    'Kab. Badung': ['Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi'],
  },
  'Nusa Tenggara Barat': {
    'Kota Mataram': ['Ampenan', 'Cakranegara', 'Mataram', 'Sandubaya', 'Sekarbela', 'Selaparang'],
    'Kab. Lombok Barat': ['Batu Layar', 'Gerung', 'Gunung Sari', 'Kediri', 'Kuripan', 'Labuapi', 'Lembar', 'Lingsar', 'Narmada', 'Sekotong'],
    'Kab. Lombok Tengah': ['Batukliang', 'Batukliang Utara', 'Janapria', 'Jonggat', 'Kopang', 'Praya', 'Praya Barat', 'Praya Barat Daya', 'Praya Tengah', 'Praya Timur', 'Pujut', 'Pringgarata'],
    'Kab. Lombok Timur': ['Aikmel', 'Jerowaru', 'Keruak', 'Labuhan Haji', 'Masbagik', 'Montong Gading', 'Pringgabaya', 'Pringgasela', 'Sakra', 'Sakra Barat', 'Sakra Timur', 'Sambelia', 'Selong', 'Sembalun', 'Sikur', 'Suwela', 'Terara'],
    'Kab. Lombok Utara': ['Bayan', 'Gangga', 'Kayangan', 'Pemenang', 'Tanjung'],
  }
};

const FALLBACK_VILLAGES = ['Desa 1', 'Desa 2', 'Desa 3', 'Kelurahan A', 'Kelurahan B'];

export function useRegions() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    fetch('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json', { cache: 'force-cache' })
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch((e) => {
        console.warn('API wilayah gagal dimuat, menggunakan data fallback', e);
        setUseFallback(true);
        const fallbackProvs = Object.keys(FALLBACK_REGIONS).map(name => ({ id: name, name }));
        setProvinces(fallbackProvs);
      });
  }, []);

  const loadCities = (provinceName: string) => {
    if (useFallback) {
      const cits = Object.keys(FALLBACK_REGIONS[provinceName] || {}).map(name => ({ id: name, name }));
      setCities(cits);
      setDistricts([]);
      setVillages([]);
      return;
    }
    const p = provinces.find(x => x.name === provinceName);
    if (p) {
      fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${p.id}.json`, { cache: 'force-cache' })
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(console.error);
    } else {
      setCities([]);
    }
    setDistricts([]);
    setVillages([]);
  };

  const loadDistricts = (cityName: string) => {
    if (useFallback) {
      // Find province of this city
      let prov = '';
      for (const p in FALLBACK_REGIONS) {
        if (FALLBACK_REGIONS[p][cityName]) prov = p;
      }
      const dists = (FALLBACK_REGIONS[prov]?.[cityName] || []).map(name => ({ id: name, name }));
      setDistricts(dists);
      setVillages([]);
      return;
    }
    const c = cities.find(x => x.name === cityName);
    if (c) {
      fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${c.id}.json`, { cache: 'force-cache' })
        .then(res => res.json())
        .then(data => setDistricts(data))
        .catch(console.error);
    } else {
      setDistricts([]);
    }
    setVillages([]);
  };

  const loadVillages = (districtName: string) => {
    if (useFallback) {
      setVillages(FALLBACK_VILLAGES.map(name => ({ id: name, name })));
      return;
    }
    const d = districts.find(x => x.name === districtName);
    if (d) {
      fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/villages/${d.id}.json`, { cache: 'force-cache' })
        .then(res => res.json())
        .then(data => setVillages(data))
        .catch(console.error);
    } else {
      setVillages([]);
    }
  };

  const loadHierarchy = async (provinceName: string, cityName: string, districtName: string) => {
    try {
      const resP = await fetch('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json', { cache: 'force-cache' });
      const provs = await resP.json();
      setProvinces(provs);
      
      const p = provs.find((x: any) => x.name === provinceName);
      if (!p) return;
      
      const resC = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${p.id}.json`, { cache: 'force-cache' });
      const cits = await resC.json();
      setCities(cits);
      
      const c = cits.find((x: any) => x.name === cityName);
      if (!c) return;
      
      const resD = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${c.id}.json`, { cache: 'force-cache' });
      const dists = await resD.json();
      setDistricts(dists);
      
      const d = dists.find((x: any) => x.name === districtName);
      if (!d) return;
      
      const resV = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/villages/${d.id}.json`, { cache: 'force-cache' });
      const vills = await resV.json();
      setVillages(vills);
    } catch (e) {
      console.warn('Hierarchy load failed, using fallback', e);
      setUseFallback(true);
      setProvinces(Object.keys(FALLBACK_REGIONS).map(name => ({ id: name, name })));
      const cits = Object.keys(FALLBACK_REGIONS[provinceName] || {}).map(name => ({ id: name, name }));
      setCities(cits);
      const dists = (FALLBACK_REGIONS[provinceName]?.[cityName] || []).map(name => ({ id: name, name }));
      setDistricts(dists);
      setVillages(FALLBACK_VILLAGES.map(name => ({ id: name, name })));
    }
  };

  return {
    provinces, cities, districts, villages,
    loadCities, loadDistricts, loadVillages, loadHierarchy
  };
}
