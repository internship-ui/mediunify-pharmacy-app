import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { PharmacyProvider } from "./src/context/PharmacyContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <PharmacyProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </PharmacyProvider>
    </SafeAreaProvider>
  );
}