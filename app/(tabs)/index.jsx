import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { homeStyles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import LogoutButton from '../components/LogoutButton';

const HomeScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  // ## 수정된 부분 ##: URL 변수를 require 구문으로 변경했습니다.
  const scanImageUrl = require('../../assets/images/scan.png');
  const articleImageUrl = require('../../assets/images/article.png'); 

  return (
    <View style={homeStyles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        contentContainerStyle={homeStyles.scrollContent}
      >
        
        <View style={homeStyles.welcomeSection}>
          <Text style={homeStyles.welcomeText}>Welcome to CheckCheck</Text>
          <LogoutButton />
        </View>
        
        <View style={homeStyles.featuredSection}>
          <TouchableOpacity activeOpacity={1}  style={homeStyles.featuredCard} onPress={() => router.push("/survey")}>
            <View style={homeStyles.featuredImageContainer}>
              <View style={homeStyles.featuredOverlay}>
                <View style={homeStyles.featuredBadge}>
                  <Text style={homeStyles.featuredBadgeText}>Featured</Text>
                </View>
                <View style={homeStyles.featuredContent}>
                  <Text style={homeStyles.featuredTitle}>보안 설문조사 시작하기</Text>
                  <View style={homeStyles.featuredMeta}>
                    <View style={homeStyles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={COLORS.white} />
                      <Text style={homeStyles.metaText}>10분 소요</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={homeStyles.titleSection}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>카테고리</Text>
          </View>
        </View>

        <View style={homeStyles.menuGrid}>
            {/* 자동 스캔 검사 카드 */}
            <TouchableOpacity activeOpacity={1}  style={homeStyles.menuCard} onPress={() => router.push("/scan")}>
              {/* ## 수정된 부분 ##: source prop을 올바르게 수정했습니다. */}
              <Image 
                source={scanImageUrl} 
                style={homeStyles.menuCardImage}
              />
              <Text style={homeStyles.menuCardText}>자동 스캔 검사</Text>
            </TouchableOpacity>

            {/* 보안에 관한 이야기 카드 */}
            <TouchableOpacity activeOpacity={1}  style={homeStyles.menuCard} onPress={() => router.push("/article")}>
              {/* ## 수정된 부분 ##: source prop을 올바르게 수정했습니다. */}
              <Image 
                source={articleImageUrl} 
                style={homeStyles.menuCardImage}
              />
              <Text style={homeStyles.menuCardText}>보안에 관한 이야기</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
