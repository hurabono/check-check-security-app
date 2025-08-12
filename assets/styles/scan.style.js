import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");

export const scanStyles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        flexDirection: "column",
      },

      welcomeSection: {
        textAlign: "center",
        marginBottom: 20, 
        justifyContent: "center",
        alignItems: "center",   
        marginTop: 20,
      },

      title: {
        
      },

      fontType:{
        fontSize: 18 ,
        letterSpacing: 0.5,
        color: COLORS.text,
        textAlign: "left",
      },

      fontTitle : {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 30,
        color: COLORS.text,
        letterSpacing:0.8,
        textAlign: "center",
      },

      scanButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 18,
        borderRadius: 12,
        width: width * 0.8,
        alignSelf: "center",
        justifyContent: "center",
      },
      imageContainer: {
        marginTop:50,
        width: 150,
        height: 150,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
      },
      image: {
        width: 150,
        height: 150,
        resizeMode: "contain", 
        
      },

});