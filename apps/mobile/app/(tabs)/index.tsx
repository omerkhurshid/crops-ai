import { useEffect, useState } from 'react';
import { Platform, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { databaseService } from '@/services/database';
import { authService } from '@/services/auth';
import { locationService } from '@/services/location';
import { syncService } from '@/services/sync';

export default function HomeScreen() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    isOnline: false,
    isSyncing: false,
    pendingUploads: 0,
  });
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await databaseService.initialize();
      
      // Check sync status
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
      
      // Get current location
      const location = await locationService.getCurrentPosition();
      setCurrentLocation(location);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert('Initialization Error', 'Failed to initialize the app. Please restart.');
    }
  };

  const handleLocationTest = async () => {
    try {
      const position = await locationService.getCurrentPosition();
      if (position) {
        Alert.alert(
          'Current Location',
          `Lat: ${position.latitude.toFixed(6)}\nLon: ${position.longitude.toFixed(6)}\nAccuracy: ${position.accuracy?.toFixed(2)}m`
        );
      } else {
        Alert.alert('Location Error', 'Could not get current location');
      }
    } catch (error) {
      Alert.alert('Location Error', error.message);
    }
  };

  const handleSyncTest = async () => {
    try {
      const success = await syncService.syncAll();
      Alert.alert(
        'Sync Result',
        success ? 'Sync completed successfully' : 'Sync failed'
      );
    } catch (error) {
      Alert.alert('Sync Error', error.message);
    }
  };

  if (!isInitialized) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Initializing Crops.AI...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">🌱 Crops.AI Mobile</ThemedText>
        <ThemedText type="subtitle">AI-Powered Farm Management</ThemedText>
      </ThemedView>

      <ThemedView style={styles.statusCard}>
        <ThemedText type="defaultSemiBold">System Status</ThemedText>
        <ThemedView style={styles.statusRow}>
          <Ionicons 
            name={syncStatus.isOnline ? 'wifi' : 'wifi-outline'} 
            size={20} 
            color={syncStatus.isOnline ? '#22c55e' : '#ef4444'} 
          />
          <ThemedText>
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statusRow}>
          <Ionicons 
            name={syncStatus.isSyncing ? 'sync' : 'sync-outline'} 
            size={20} 
            color={syncStatus.isSyncing ? '#3b82f6' : '#6b7280'} 
          />
          <ThemedText>
            {syncStatus.isSyncing ? 'Syncing...' : `${syncStatus.pendingUploads} pending uploads`}
          </ThemedText>
        </ThemedView>

        {currentLocation && (
          <ThemedView style={styles.statusRow}>
            <Ionicons name="location" size={20} color="#22c55e" />
            <ThemedText>
              Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView style={styles.featuresContainer}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Key Features</ThemedText>
        
        <ThemedView style={styles.featureCard}>
          <Ionicons name="location-outline" size={24} color="#22c55e" />
          <ThemedView style={styles.featureContent}>
            <ThemedText type="defaultSemiBold">GPS Field Mapping</ThemedText>
            <ThemedText>Track field boundaries and capture precise locations</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.featureCard}>
          <Ionicons name="camera-outline" size={24} color="#22c55e" />
          <ThemedView style={styles.featureContent}>
            <ThemedText type="defaultSemiBold">Photo Documentation</ThemedText>
            <ThemedText>Capture and analyze crop photos with GPS metadata</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.featureCard}>
          <Ionicons name="cloud-offline-outline" size={24} color="#22c55e" />
          <ThemedView style={styles.featureContent}>
            <ThemedText type="defaultSemiBold">Offline-First</ThemedText>
            <ThemedText>Work without internet, sync when connected</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.featureCard}>
          <Ionicons name="notifications-outline" size={24} color="#22c55e" />
          <ThemedView style={styles.featureContent}>
            <ThemedText type="defaultSemiBold">Smart Notifications</ThemedText>
            <ThemedText>Weather alerts and crop care reminders</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Test Functions</ThemedText>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleLocationTest}>
          <Ionicons name="location" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>Test GPS</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSyncTest}>
          <Ionicons name="sync" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>Test Sync</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.footer}>
        <ThemedText type="default" style={styles.footerText}>
          Built with React Native + Expo
        </ThemedText>
        <ThemedText type="default" style={styles.footerText}>
          Platform: {Platform.OS}
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#22c55e',
    marginBottom: 16,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  featuresContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  featureContent: {
    flex: 1,
  },
  actionsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 12,
  },
});
