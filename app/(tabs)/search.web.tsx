import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// 환경변수 이름/사용 방식은 그대로 유지
const Maps_API_KEY: string = process.env.EXPO_PUBLIC_MAPS_API_KEY || '';

// === 타입 & 상수 (이름 유지) ===
type LatLng = { latitude: number; longitude: number };

// 변수명은 그대로 두고, 값만 토론토 다운타운으로 교체
const GWANGHWAMUN_COORDS = { lat: 43.6532, lng: -79.3832 };

// 기존 로직(대문자 비교) 유지를 위해 대문자로 설정
const TELECOM_COMPANIES = ['ROGERS', 'BELL', 'TELUS'];

const PURPLE_THEME = {
  primary: '#6a1b9a',
  secondary: '#ab47bc',
  accent: '#e1bee7',
  text: '#333',
  white: '#fff',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PURPLE_THEME.white },
  mapContainer: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE_THEME.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: { flex: 1, height: 40, paddingHorizontal: 10, fontSize: 16, color: PURPLE_THEME.text },
  listContainer: {
    height: '35%',
    backgroundColor: PURPLE_THEME.white,
    borderTopWidth: 1,
    borderTopColor: PURPLE_THEME.accent,
  },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: PURPLE_THEME.primary, padding: 15 },
  itemContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: PURPLE_THEME.accent },
  itemName: { fontSize: 16, fontWeight: 'bold', color: PURPLE_THEME.text },
  itemAddress: { fontSize: 14, color: 'gray', marginTop: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: PURPLE_THEME.primary,
    borderRadius: 50,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 9999,
  },
  myLocationButtonText: { color: PURPLE_THEME.white, fontWeight: 'bold' },
});



const MapWithLogic: React.FC<{
  initialRegion: any;
  stores: any[];
  setStores: (stores: any[]) => void;
  userCurrentLocation: React.MutableRefObject<LatLng | null>;
  searchQuery: string;
  setSearchQuery: (s: string) => void;
}> = ({ initialRegion, stores, setStores, userCurrentLocation, searchQuery, setSearchQuery }) => {
  const map = useMap();
  const debounceTimer = useRef<any>(null);

  // Places v1 검색 (로직 동일)
  const fetchStores = async (region: LatLng, keywords: string[]) => {
    const allResults: any[] = [];

    for (const keyword of keywords) {
      try {
        const response = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': Maps_API_KEY,
            'X-Goog-FieldMask':
              'places.id,places.displayName,places.location,places.formattedAddress',
          },
          body: JSON.stringify({
            textQuery: keyword, 
            locationBias: {
              circle: {
                center: { latitude: region.latitude, longitude: region.longitude },
                radius: 5000,
              },
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('Place API search error: ', response.status, errText);
          continue;
        }

        const data = await response.json();
        if (data?.places?.length) {
          allResults.push(...data.places);
        }
      } catch (err) {
        console.error('Place API search error:', err);
      }
    }

    // 중복 제거
    const seen = new Set<string>();
    const uniqueStores = allResults.filter((store: any) => {
      if (!store.id || seen.has(store.id)) return false;
      seen.add(store.id);
      return true;
    });

    setStores(uniqueStores);
  };

  // 지도 idle 이벤트 (로직 동일)
  const handleWebMapIdle = () => {
    if (!map) return;
    const center = map.getCenter();
    if (!center) return;
    const newRegion: LatLng = { latitude: center.lat(), longitude: center.lng() };
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchStores(newRegion, TELECOM_COMPANIES);
    }, 800);
  };

  // 검색 (로직 동일: 통신사면 내 위치 기준, 아니면 지오코딩)
  const handleSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    const upperQuery = query.toUpperCase();
    const isTelecomSearch = TELECOM_COMPANIES.includes(upperQuery);

    if (isTelecomSearch) {
      if (!userCurrentLocation.current) {
        Alert.alert('No Location Information', 'The location could not be found..');
        return;
      }
      map?.panTo({
        lat: userCurrentLocation.current.latitude,
        lng: userCurrentLocation.current.longitude,
      });
      fetchStores(userCurrentLocation.current, [upperQuery]);
    } else {
      // geocoding은 필요할 때만 사용 (로직 동일)
      // @ts-ignore 구글 맵스 전역
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newRegion: LatLng = { latitude: location.lat(), longitude: location.lng() };
          map?.panTo({ lat: newRegion.latitude, lng: newRegion.longitude });
          fetchStores(newRegion, TELECOM_COMPANIES);
        } else {
          Alert.alert('Search failed', 'The location could not be found..');
        }
      });
    }
  };

  // 내 위치 버튼 (로직 동일)
  const goToMyLocation = () => {
    if (!userCurrentLocation.current) {
      Alert.alert('No Location Information', 'You need to get your current location first.');
      return;
    }
    map?.panTo({
      lat: userCurrentLocation.current.latitude,
      lng: userCurrentLocation.current.longitude,
    });
    fetchStores(userCurrentLocation.current, TELECOM_COMPANIES);
  };

  return (
    <>
      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search for a region or carrier"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={{ padding: 8 }}>
          <Text style={{ color: PURPLE_THEME.primary, fontSize: 16 }}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* 지도 */}
      <Map
        defaultCenter={{
          lat: initialRegion.latitude,
          lng: initialRegion.longitude,
        }}
        defaultZoom={16}
        gestureHandling="greedy"
        disableDefaultUI={true}
        onIdle={handleWebMapIdle}
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={{
              lat: store.location.latitude,
              lng: store.location.longitude,
            }}
            title={store.displayName?.text || 'No display name'}
          />
        ))}
      </Map>

      {/* 내 위치 버튼 */}
      <TouchableOpacity style={styles.myLocationButton} onPress={goToMyLocation}>
        <Text style={styles.myLocationButtonText}>📍</Text>
      </TouchableOpacity>
    </>
  );
};

const SearchWeb: React.FC = () => {
  const [initialRegion, setInitialRegion] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const userCurrentLocation = useRef<LatLng | null>(null);

  const toLatLng = (p: { lat: number; lng: number }): LatLng => ({
    latitude: p.lat,
    longitude: p.lng,
  });

  // Google 지오로케이트 API 폴백 (WiFi/IP 기반 근사 좌표)
  const googleGeolocate = async (): Promise<LatLng | null> => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${Maps_API_KEY}`,
        { method: 'POST' }
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data?.location?.lat && data?.location?.lng) {
        return { latitude: data.location.lat, longitude: data.location.lng };
      }
    } catch (e) {
      console.log('Google Geolocation API 실패', e);
    }
    return null;
    };

  // 캐나다 여부 판별
  const isInCanada = async (coords: LatLng): Promise<boolean> => {
    try {
      const resp = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${Maps_API_KEY}`
      );
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data?.results)) {
          const hit = data.results.some((r: any) =>
            String(r.formatted_address || '').includes('Canada')
          );
          if (hit) return true;
        }
      }
    } catch (e) {
      console.log('Geocoding failed, using boundary box fallback', e);
    }

    const { latitude, longitude } = coords;
    return latitude >= 41 && latitude <= 83 && longitude >= -141 && longitude <= -52;
  };

  useEffect(() => {
    const initialize = async () => {
      // 기본디폴트 토론토 다운타운
      let coords: LatLng = toLatLng(GWANGHWAMUN_COORDS);

      const setRegion = (c: LatLng) =>
        setInitialRegion({ ...c, latitudeDelta: 0.02, longitudeDelta: 0.01 });

      // 브라우저 Geolocation 시도
      const getBrowserGeo = (): Promise<LatLng | null> =>
        new Promise((resolve) => {
          if (!navigator.geolocation) return resolve(null);
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            },
            async () => {
              resolve(null);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
          );
        });

      let current: LatLng | null = await getBrowserGeo();

      // 실패 시 Google Geolocation API 폴백
      if (!current) {
        current = await googleGeolocate();
      }

      if (current) {
        userCurrentLocation.current = current;
        const inCanada = await isInCanada(current);
        coords = inCanada ? current : toLatLng(GWANGHWAMUN_COORDS);
      } else {
        // 전부 실패하면 토론토 다운타운
        coords = toLatLng(GWANGHWAMUN_COORDS);
      }

      setRegion(coords);
    };

    initialize();
  }, []);

  if (!initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE_THEME.primary} />
        <Text>Getting map information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* places/지오코딩 사용하므로 라이브러리 로드 */}
      <APIProvider apiKey={Maps_API_KEY} libraries={['places']}>
        <View style={styles.mapContainer}>
          <MapWithLogic
            initialRegion={initialRegion}
            stores={stores}
            setStores={setStores}
            userCurrentLocation={userCurrentLocation}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </View>
      </APIProvider>

      {/* 매장 목록 */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>A nearby carrier store</Text>
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <View style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.displayName?.text}</Text>
                <Text style={styles.itemAddress}>{item.formattedAddress}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

export default SearchWeb;
