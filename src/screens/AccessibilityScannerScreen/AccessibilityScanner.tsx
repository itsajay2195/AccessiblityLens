import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {saveAnalysis} from '../../services/StorageService';
const {width, height} = Dimensions.get('window');
const AccessibilityScanner = ({navigation}: any) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const camera = useRef<any>(null);
  const devices: any = useCameraDevices();
  const device = devices?.back;

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission: any = await Camera.requestCameraPermission();
      setHasPermission(permission === 'authorized');

      if (permission !== 'authorized') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to scan locations for accessibility features.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const takePicture = async () => {
    if (!camera.current) return;

    try {
      setIsAnalyzing(true);
      setCameraActive(false);

      const photo = await camera.current?.takePhoto({
        quality: 0.8,
        base64: true,
      });

      // Analyze the photo
      const analysis: any = await analyzeAccessibility(photo.base64);

      // Save to local storage
      const savedAnalysis = await saveAnalysis({
        ...analysis,
        photoPath: photo.path,
        timestamp: new Date().toISOString(),
      });

      // Navigate to results
      navigation.navigate('Results', {
        analysis: savedAnalysis,
        photoPath: photo.path,
      });
    } catch (error) {
      console.error('Photo capture/analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        'Unable to analyze the photo. Please try again.',
        [{text: 'OK'}],
      );
    } finally {
      setIsAnalyzing(false);
      setCameraActive(true);
    }
  };

  const goToHistory = () => {
    navigation?.navigate('History');
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-alt" size={64} color="#9CA3AF" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            AccessibilityLens needs camera access to scan locations and identify
            accessibility features.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {cameraActive && (
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={cameraActive}
            photo={true}
          />
        )}

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Text style={styles.instruction}>
              Point camera at entrances, pathways, or any location
            </Text>
          </View>

          {/* Center Guide */}
          <View style={styles.centerGuide}>
            <View style={styles.guideFrame} />
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={goToHistory}>
              <Icon name="history" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isAnalyzing && styles.captureButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={isAnalyzing}>
              {isAnalyzing ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <View style={styles.captureInner}>
                  <Icon name="camera-alt" size={32} color="#2563EB" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsButton}>
              <Icon name="settings" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Analysis Loading Overlay */}
        {isAnalyzing && (
          <View style={styles.analysisOverlay}>
            <View style={styles.analysisContainer}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.analysisText}>
                Analyzing accessibility...
              </Text>
              <Text style={styles.analysisSubtext}>
                Detecting barriers and measuring dimensions
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AccessibilityScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Scanner Styles
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topBar: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  instruction: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  centerGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: width * 0.8,
    height: width * 0.6,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  historyButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  analysisText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 15,
    textAlign: 'center',
  },
  analysisSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
    textAlign: 'center',
  },
});
