import { useUser } from '@clerk/clerk-react';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { homeStyles } from "../../assets/styles/home.styles";
import { COLORS } from "../../constants/colors";
import LogoutButton from '../components/LogoutButton';


const getGreetingMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return `☀️ Good morning! how are  you today?`; 
  if (hour < 18) return `🌤️ Do not forget safe protection cyber life!`; 
  return `🌙 Hava a good night! Sweet Dream!`; 
};


const HomeScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUser();
  const greetingMessage = getGreetingMessage();
  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };


  const scanImageUrl = require('../../assets/images/scan.png');
  const articleImageUrl = require('../../assets/images/article.png');
  const smishingChecker = require('../../assets/images/spam.png');
  const emailChecker = require('../../assets/images/email.png');

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
          <Text style={homeStyles.welcomeText}>Check-Check</Text>
          <Text style={homeStyles.subText}>{greetingMessage}</Text>
          <View style={homeStyles.LoginEmail}>
            <Text style= {homeStyles.basicText}> {user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "사용자"}</Text>
            <LogoutButton />
          </View>
        </View>
        
        <View style={homeStyles.featuredSection}>
          <TouchableOpacity activeOpacity={1}  style={homeStyles.featuredCard} onPress={() => router.push("/survey")}>
            <View style={homeStyles.featuredImageContainer}>
              <View style={homeStyles.featuredOverlay}>
                <View style={homeStyles.featuredBadge}>
                  <Text style={homeStyles.featuredBadgeText}>Featured</Text>
                </View>
                <View style={homeStyles.featuredContent}>
                  <Text style={homeStyles.featuredTitle}>Start cybersecurity survey</Text>
                  <View style={homeStyles.featuredMeta}>
                    <View style={homeStyles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={COLORS.white} />
                      <Text style={homeStyles.metaText}>spend 10min</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={homeStyles.titleSection}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>Category</Text>
          </View>
        </View>

        <View style={homeStyles.menuGrid}>
            {/* 자동 스캔 검사 카드 */}
            <TouchableOpacity activeOpacity={1}  style={homeStyles.menuCard} onPress={() => router.push("/scan")}>
              <Image 
                source={scanImageUrl} 
                style={homeStyles.menuCardImage}
              />
              <Text style={homeStyles.menuCardText}> Autometic Scan checker</Text>
            </TouchableOpacity>

            {/* 보안에 관한 이야기 카드 */}
            <TouchableOpacity activeOpacity={1}  style={homeStyles.menuCard} onPress={() => router.push("/article")}>
              <Image 
                source={articleImageUrl} 
                style={homeStyles.menuCardImage}
              />
              <Text style={homeStyles.menuCardText}>Security articles</Text>
            </TouchableOpacity>


            <TouchableOpacity activeOpacity={1} style={homeStyles.menuCard} onPress={() => router.push("/SmsAnalysis")} >
              <Image 
                source={smishingChecker} 
                style={homeStyles.menuCardImage}
              />
              <Text style={homeStyles.menuCardText}> SMS Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity style={homeStyles.menuCard} onPress={() => router.push("/emailAnalysis")} >
              <Image 
                source={emailChecker} 
                style={homeStyles.menuCardImage}
              />
              <Text style={homeStyles.menuCardText}> Spam Email Analysis</Text>
            </TouchableOpacity>

          </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
