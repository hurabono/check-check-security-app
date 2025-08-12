import {
    View,
    Text,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
  } from "react-native";
  import { useRouter } from "expo-router";
  import { useSignUp } from "@clerk/clerk-expo";
  import { useState } from "react";
  import { authStyles } from "../../assets/styles/auth.styles";
  import { Image } from "expo-image";
  import { COLORS } from "../../constants/colors";
  
  import { Ionicons } from "@expo/vector-icons";
  import VerifyEmail from "./verify-email";
  
  const SignUpScreen = () => {
    const router = useRouter();
    const { isLoaded, signUp } = useSignUp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
  
    const handleSignUp = async () => {
      if (!email || !password) return Alert.alert("오류", "모든 필드를 입력해주세요");
      if (password.length < 6) return Alert.alert("오류", "비밀번호는 6자 이상이어야 합니다");
  
      if (!isLoaded) return;
  
      setLoading(true);
  
      try {
        await signUp.create({ emailAddress: email, password });
  
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
  
        setPendingVerification(true);
      } catch (err) {
        Alert.alert("오류", err.errors?.[0]?.message || "계정 생성 실패");
        console.error(JSON.stringify(err, null, 2));
      } finally {
        setLoading(false);
      }
    };
  
    if (pendingVerification)
      return <VerifyEmail email={email} onBack={() => setPendingVerification(false)} />;
  
    return (
      <View style={authStyles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
          style={authStyles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={authStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Container */}
            <View style={authStyles.imageContainer}>
              <Image
                source={require("../../assets/images/i2.png")}
                style={authStyles.image}
                contentFit="contain"
              />
            </View>
  
            <Text style={authStyles.title}>회원가입</Text>
  
            <View style={authStyles.formContainer}>
              {/* Email Input */}
              <View style={authStyles.inputContainer}>
                <TextInput
                  style={authStyles.textInput}
                  placeholder="이메일"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
  
              {/* Password Input */}
              <View style={authStyles.inputContainer}>
                <TextInput
                  style={authStyles.textInput}
                  placeholder="비밀번호"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={authStyles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>
  
              {/* Sign Up Button */}
              <TouchableOpacity
                style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={authStyles.buttonText}>
                  {loading ? "회원가입 진행중.." : "회원가입"}
                </Text>
              </TouchableOpacity>
  
              {/* Sign In Link */}
              <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.back()}>
                <Text style={authStyles.linkText}>
                 이미 계정이 있으신가요? <Text style={authStyles.link}>로그인</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  };
  export default SignUpScreen;