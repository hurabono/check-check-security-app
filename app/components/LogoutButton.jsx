import React from 'react';
import { TouchableOpacity, Alert, Text } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { COLORS } from "../../constants/colors";
import { homeStyles } from "../../assets/styles/home.styles";

export default function LogoutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert("로그아웃 성공", "성공적으로 로그아웃되었습니다.");
      // Redirect to sign-in page after logout
      router.replace("/sign-in"); 
    } catch (error) {
      console.error("로그아웃 오류:", error);
      Alert.alert("오류", "로그아웃에 실패했습니다.");
    }
  };

  return <TouchableOpacity title="로그아웃" onPress={handleLogout} style={homeStyles.signoutButton}>
    <Text style={{ color: COLORS.white, textAlign: 'center', fontSize: 16 }}>로그아웃</Text>
  </TouchableOpacity>;
}
