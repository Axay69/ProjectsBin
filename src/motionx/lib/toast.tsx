import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <View style={{ 
      height: 60, 
      width: '90%', 
      backgroundColor: '#111827', 
      borderRadius: 12, 
      borderLeftWidth: 6, 
      borderLeftColor: '#0EA5A4',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#1F2937'
    }}>
      <MaterialCommunityIcons name="check-circle" size={24} color="#0EA5A4" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#F9FAFB' }}>{props.text1}</Text>
        {props.text2 ? (
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{props.text2}</Text>
        ) : null}
      </View>
    </View>
  ),
  error: (props) => (
    <View style={{ 
      height: 60, 
      width: '90%', 
      backgroundColor: '#111827', 
      borderRadius: 12, 
      borderLeftWidth: 6, 
      borderLeftColor: '#EF4444',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#1F2937'
    }}>
      <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#F9FAFB' }}>{props.text1}</Text>
        {props.text2 ? (
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{props.text2}</Text>
        ) : null}
      </View>
    </View>
  ),
  info: (props) => (
    <View style={{ 
      height: 60, 
      width: '90%', 
      backgroundColor: '#111827', 
      borderRadius: 12, 
      borderLeftWidth: 6, 
      borderLeftColor: '#3B82F6',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#1F2937'
    }}>
      <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#F9FAFB' }}>{props.text1}</Text>
        {props.text2 ? (
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{props.text2}</Text>
        ) : null}
      </View>
    </View>
  )
};

export const showToast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 60,
      visibilityTime: 3000,
    });
  },
  error: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 60,
      visibilityTime: 4000,
    });
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      topOffset: 60,
      visibilityTime: 3000,
    });
  }
};
