import { useSignUp } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authStyles } from "../../assets/styles/auth.styles";
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
      if (!email || !password) return Alert.alert("ERROR", "YOU HAVE TO ENTIRE ALL FIELDS");
      if (password.length < 6) return Alert.alert("ERROR", "PLEASE SET THE PASSWORD OVER 6 WORDS");
  
      if (!isLoaded) return;
  
      setLoading(true);
  
      try {
        await signUp.create({ emailAddress: email, password });
  
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
  
        setPendingVerification(true);
      } catch (err) {
        Alert.alert("ERROR", err.errors?.[0]?.message || "CREATING ACCOUNT FAILED");
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
  
            <Text style={authStyles.title}>SIGN UP</Text>
  
            <View style={authStyles.formContainer}>
              {/* Email Input */}
              <View style={authStyles.inputContainer}>
                <TextInput
                  style={authStyles.textInput}
                  placeholder="EMAIL"
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
                  placeholder="PASSWORD"
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
                  {loading ? "PROCESSING SIGNUP.." : "JOIN NOW"}
                </Text>
              </TouchableOpacity>
  
              {/* Sign In Link */}
              <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.back()}>
                <Text style={authStyles.linkText}>
                 DO YOU HAVE ACCOUNT? <Text style={authStyles.link}>LOGIN</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  };
  export default SignUpScreen;