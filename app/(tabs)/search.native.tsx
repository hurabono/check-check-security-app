import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker as NativeMarker, PROVIDER_GOOGLE, Region as RNRegion } from 'react-native-maps';


const isWeb = Platform.OS === 'web';
if (Platform.OS === 'web') {
  throw new Error("🚫 search.native.tsx가 웹에서 잘못 불렸습니다!");
}

const Maps_API_KEY: string = process.env.EXPO_PUBLIC_MAPS_API_KEY!;

const GWANGHWAMUN_COORDS = { lat: 37.5759, lng: 126.9770 };
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
    position: 'absolute', top: isWeb ? 10 : 50, left: 10, right: 10, zIndex: 1,
    flexDirection: 'row', alignItems: 'center', backgroundColor: PURPLE_THEME.white,
    borderRadius: 8, paddingHorizontal: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  input: { flex: 1, height: 40, paddingHorizontal: 10, fontSize: 16, color: PURPLE_THEME.text },
  listContainer: { height: '35%', backgroundColor: PURPLE_THEME.white, borderTopWidth: 1, borderTopColor: PURPLE_THEME.accent },
  listTitle: { fontSize: 18, fontWeight: 'bold', color: PURPLE_THEME.primary, padding: 15 },
  itemContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: PURPLE_THEME.accent },
  itemName: { fontSize: 16, fontWeight: 'bold', color: PURPLE_THEME.text },
  itemAddress: { fontSize: 14, color: 'gray', marginTop: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyListContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyListText: { textAlign: 'center', fontSize: 16, color: 'gray' },
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
  },
  myLocationButtonText: {
    color: PURPLE_THEME.white,
    fontWeight: 'bold',
  }
});

type LatLng = { latitude: number; longitude: number };

const Search = () => {
  const [initialRegion, setInitialRegion] = useState<RNRegion | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userCurrentLocation = useRef<LatLng | null>(null);

  useEffect(() => {
    const initialize = async () => {
      let coords: LatLng = { latitude: GWANGHWAMUN_COORDS.lat, longitude: GWANGHWAMUN_COORDS.lng };
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({ timeout: 5000 } as any);
          userCurrentLocation.current = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          if (Maps_API_KEY && !Maps_API_KEY.includes('YOUR_REAL')) {
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${Maps_API_KEY}&language=ko`;
            const response = await fetch(geocodeUrl);
            const reverseGeocode = await response.json();
            if (reverseGeocode.results && reverseGeocode.results.some((res: any) => res.formatted_address.includes('대한민국'))) {
              coords = userCurrentLocation.current!;
            }
          } else {
            coords = userCurrentLocation.current!;
          }
        }
      } catch (e) {
        console.log("위치 가져오기 에러, 기본 위치(광화문)으로 설정합니다.", e);
      }

      const region: RNRegion = { ...coords, latitudeDelta: 0.02, longitudeDelta: 0.01 };
      setInitialRegion(region);
      fetchStores(region, TELECOM_COMPANIES);
    };

    initialize();
  }, []);

  const fetchStores = useCallback(async (region: LatLng, keywords: string[]) => {
    if (!region || !Maps_API_KEY || Maps_API_KEY.includes('YOUR_REAL') || !keywords || keywords.length === 0) {
      setIsLoading(false);
      setStores([]);
      return;
    }
    setIsLoading(true);
    try {
      const resultsPromises = keywords.map(async (keyword) => {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${region.latitude},${region.longitude}&radius=5000&keyword=${encodeURIComponent(keyword)}&language=ko&key=${Maps_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK') return data.results;
        if (data.status !== 'ZERO_RESULTS') console.error(`'${keyword}' 검색 API 오류:`, data.status, data.error_message || '');
        return [];
      });
      const resultsArrays = await Promise.all(resultsPromises);
      const allStores = resultsArrays.flat();
      const uniqueStores = Array.from(new Set(allStores.map((s: any) => s.place_id))).map((id) => allStores.find((s: any) => s.place_id === id));
      setStores(uniqueStores);
    } catch (error) {
      console.error('검색 중 에러 발생:', error);
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedFetchStores = useCallback((region: LatLng) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchStores(region, TELECOM_COMPANIES);
    }, 800);
  }, [fetchStores]);

  const handleRegionChangeComplete = (newRegion: RNRegion) => {
    debouncedFetchStores({ latitude: newRegion.latitude, longitude: newRegion.longitude });
  };

  const animateToRegion = (region: LatLng) => {
    const mapRegion: RNRegion = { ...region, latitudeDelta: 0.02, longitudeDelta: 0.01 };
    if (mapRef.current) {
      (mapRef.current as any).animateToRegion(mapRegion, 1000);
    }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    const upperQuery = query.toUpperCase();
    const isTelecomSearch = TELECOM_COMPANIES.includes(upperQuery);

    setIsLoading(true);

    if (isTelecomSearch) {
      if (!userCurrentLocation.current) {
        Alert.alert("위치 정보 없음", "현재 위치를 찾을 수 없습니다. 위치 권한을 확인해주세요.");
        setIsLoading(false);
        return;
      }
      animateToRegion(userCurrentLocation.current);
      fetchStores(userCurrentLocation.current!, [upperQuery]);
    } else {
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${Maps_API_KEY}&language=ko`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const newRegion: LatLng = { latitude: location.lat, longitude: location.lng };
          animateToRegion(newRegion);
          fetchStores(newRegion, TELECOM_COMPANIES);
        } else {
          Alert.alert("검색 실패", "해당 위치를 찾을 수 없습니다.");
          setIsLoading(false);
        }
      } catch (error) {
        Alert.alert("오류", "검색 중 오류가 발생했습니다.");
        console.error("Geocoding error:", error);
        setIsLoading(false);
      }
    }
  };

  const goToMyLocation = async () => {
    setIsLoading(true);
    try {
      if (!userCurrentLocation.current) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("위치 권한 없음", "위치 권한을 허용해야 현재 위치로 이동할 수 있습니다.");
          setIsLoading(false);
          return;
        }
        const location = await Location.getCurrentPositionAsync({ timeout: 5000 } as any);
        userCurrentLocation.current = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      animateToRegion(userCurrentLocation.current);
      fetchStores(userCurrentLocation.current!, TELECOM_COMPANIES);

    } catch (error) {
      Alert.alert("오류", "현재 위치를 가져오는 데 실패했습니다.");
      setIsLoading(false);
    }
  };

  const onStoreSelect = (store: any) => {
    const region: LatLng = {
      latitude: store.geometry.location.lat,
      longitude: store.geometry.location.lng,
    };
    const mapRegion: RNRegion = { ...region, latitudeDelta: 0.01, longitudeDelta: 0.005 };
    if (mapRef.current) (mapRef.current as any).animateToRegion(mapRegion, 1000);
  };

  const renderListEmpty = () => {
    if (isLoading) return (
      <View style={styles.emptyListContainer}>
        <ActivityIndicator size="large" color={PURPLE_THEME.primary} />
        <Text style={{ marginTop: 10, color: 'gray' }}>주변 매장을 찾고 있습니다...</Text>
      </View>
    );

    if (!Maps_API_KEY || Maps_API_KEY.includes('YOUR_REAL')) {
      return (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>유효한 Google Maps API 키를 입력해주세요.</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyListContainer}>
        <Text style={styles.emptyListText}>주변에 검색된 매장이 없습니다.{"\n"}지도를 움직이거나 다른 키워드로 검색해보세요.</Text>
      </View>
    );
  };

  if (!initialRegion) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={PURPLE_THEME.primary} />
      <Text>지도 정보를 불러오는 중...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput style={styles.input} placeholder="지역 또는 통신사 검색" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch} returnKeyType="search"/>
        <TouchableOpacity onPress={handleSearch} style={{ padding: 8 }}><Text style={{ color: PURPLE_THEME.primary, fontSize: 16 }}>검색</Text></TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion!}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={false}
        >
          {stores.map((store) => (
            <NativeMarker
              key={store.place_id}
              coordinate={{ latitude: store.geometry.location.lat, longitude: store.geometry.location.lng }}
              title={store.name}
              description={store.vicinity}
              pinColor={PURPLE_THEME.primary}
              onPress={() => onStoreSelect(store)}
            />
          ))}
        </MapView>

        <TouchableOpacity style={styles.myLocationButton} onPress={goToMyLocation}>
          <Text style={styles.myLocationButtonText}>📍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>주변 통신사 매장</Text>
        <FlatList
          data={stores}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onStoreSelect(item)}>
              <View style={styles.itemContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemAddress}>{item.vicinity}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={renderListEmpty}
        />
      </View>
    </View>
  );
};

export default Search;
