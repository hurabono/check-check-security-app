import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import * as Location from 'expo-location';
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

const Maps_API_KEY: string = process.env.EXPO_PUBLIC_MAPS_API_KEY || '';

const GWANGHWAMUN_COORDS = { lat: 37.5759, lng: 126.977 };
const TELECOM_COMPANIES = ['SKT', 'KT', 'LG U+'];
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

type LatLng = { latitude: number; longitude: number };

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

  // ✅ Places API v1 기반 매장 검색 (새로운 API)

  const fetchStores = async (region: any, keywords: string[]) => {
  const allResults: any[] = [];

  for (const keyword of keywords) {
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places:searchText`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.EXPO_PUBLIC_MAPS_API_KEY || "",
            "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.formattedAddress"
          },
          body: JSON.stringify({
            textQuery: keyword,
            locationBias: {
              circle: {
                center: { latitude: region.latitude, longitude: region.longitude },
                radius: 5000
              }
            }
          })
        }
      );

      const data = await response.json();
      if (data.places) {
        allResults.push(...data.places);
      }
    } catch (err) {
      console.error("Place API 검색 에러:", err);
    }
  }

  // ✅ 중복 제거
  const seen = new Set<string>();
  const uniqueStores = allResults.filter((store: any) => {
    if (!store.id || seen.has(store.id)) return false;
    seen.add(store.id);
    return true;
  });

  setStores(uniqueStores);
};




  // ✅ 지도 idle 이벤트
  const handleWebMapIdle = () => {
    if (!map) return;
    const center = map.getCenter();
    if (!center) return;
    const newRegion = { latitude: center.lat(), longitude: center.lng() };
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchStores(newRegion, TELECOM_COMPANIES);
    }, 800);
  };

  // ✅ 검색
  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    const upperQuery = query.toUpperCase();
    const isTelecomSearch = TELECOM_COMPANIES.includes(upperQuery);

    if (isTelecomSearch) {
      if (!userCurrentLocation.current) {
        Alert.alert('위치 정보 없음', '현재 위치를 찾을 수 없습니다.');
        return;
      }
      map?.panTo({
        lat: userCurrentLocation.current.latitude,
        lng: userCurrentLocation.current.longitude,
      });
      fetchStores(userCurrentLocation.current, [upperQuery]);
    } else {
      // geocoding은 필요할 때만 사용
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const newRegion = { latitude: location.lat(), longitude: location.lng() };
          map?.panTo({ lat: newRegion.latitude, lng: newRegion.longitude });
          fetchStores(newRegion, TELECOM_COMPANIES);
        } else {
          Alert.alert('검색 실패', '해당 위치를 찾을 수 없습니다.');
        }
      });
    }
  };

  // ✅ 내 위치 버튼
  const goToMyLocation = async () => {
  try {
    if (!userCurrentLocation.current) {
      Alert.alert('위치 정보 없음', '현재 위치를 먼저 가져와야 합니다.');
      return;
    }

    console.log("내 위치 이동:", userCurrentLocation.current);

    map?.panTo({
      lat: userCurrentLocation.current.latitude,
      lng: userCurrentLocation.current.longitude,
    });

    fetchStores(userCurrentLocation.current, TELECOM_COMPANIES);
  } catch (error) {
    Alert.alert('오류', '현재 위치로 이동할 수 없습니다.');
    console.error("goToMyLocation 오류:", error);
  }
};

  return (
    <>
      {/* 검색창 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="지역 또는 통신사 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={{ padding: 8 }}>
          <Text style={{ color: PURPLE_THEME.primary, fontSize: 16 }}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 지도 */}
      <Map
        defaultCenter={{ lat: initialRegion.latitude, lng: initialRegion.longitude }}
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
            title={store.displayName?.text || '상호명 없음'}
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

  useEffect(() => {
    const initialize = async () => {
      let coords: LatLng = {
        latitude: GWANGHWAMUN_COORDS.lat,
        longitude: GWANGHWAMUN_COORDS.lng,
      };
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync();
          userCurrentLocation.current = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          coords = userCurrentLocation.current;
        }
      } catch (e) {
        console.log('위치 가져오기 에러, 기본 위치(광화문)으로 설정합니다.', e);
      }
      setInitialRegion({ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.01 });
    };
    initialize();
  }, []);

  if (!initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PURPLE_THEME.primary} />
        <Text>지도 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <APIProvider apiKey={Maps_API_KEY}>
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
        <Text style={styles.listTitle}>주변 통신사 매장</Text>
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
