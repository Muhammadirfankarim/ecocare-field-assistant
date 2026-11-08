// src/lib/nativeBridge.ts
/**
 * Hycare Native Mobile Bridge
 * 
 * Provides unified, defensive cross-platform access to native device hardware & OS features
 * (GPS Geolocation, Camera, Share Sheet, Haptics, Status Bar, Splash Screen).
 * 
 * Guarantees zero runtime crashes by automatically falling back to Web APIs when running in browser.
 */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface NativeLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  source: 'NATIVE_GPS' | 'BROWSER_GEOLOCATION';
}

export interface NativePhotoResult {
  base64Data?: string;
  webPath?: string;
  format: string;
  timestamp: number;
}

export interface NativeSharePayload {
  title: string;
  text: string;
  url?: string;
  dialogTitle?: string;
}

/**
 * Checks if running inside native Android or iOS container.
 */
export function isNativeMobile(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Returns current platform name: 'android', 'ios', or 'web'.
 */
export function getPlatform(): 'android' | 'ios' | 'web' {
  const platform = Capacitor.getPlatform();
  if (platform === 'android' || platform === 'ios') {
    return platform;
  }
  return 'web';
}

/**
 * Initializes mobile native environment (StatusBar, SplashScreen).
 * Safe to call unconditionally in Root Layout or App Page.
 */
export async function initializeNativeApp(): Promise<void> {
  if (!isNativeMobile()) return;

  try {
    // Set Status Bar style to Dark content (or Light on dark background)
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
    }
  } catch (err) {
    console.warn('[NativeBridge] StatusBar init warning:', err);
  }

  try {
    // Hide splash screen after initialization
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[NativeBridge] SplashScreen hide warning:', err);
  }
}

/**
 * Triggers tactile haptic feedback on mobile devices.
 */
export async function triggerHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'
): Promise<void> {
  if (!isNativeMobile()) {
    // Browser fallback (if navigator.vibrate is supported)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'error' || type === 'heavy') navigator.vibrate(50);
        else navigator.vibrate(20);
      } catch {
        // Ignore fallback vibration errors
      }
    }
    return;
  }

  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch (err) {
    console.warn('[NativeBridge] Haptics trigger error:', err);
  }
}

/**
 * Captures current GPS coordinates for building survey verification.
 */
export async function getCurrentCoordinates(): Promise<NativeLocationResult> {
  if (isNativeMobile()) {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
          throw new Error('Izin lokasi GPS ditolak oleh pengguna.');
        }
      }

      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        source: 'NATIVE_GPS',
      };
    } catch (nativeErr) {
      console.warn('[NativeBridge] Native Geolocation error, falling back to browser API:', nativeErr);
    }
  }

  // Web Browser fallback
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung pada browser/perangkat ini.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          source: 'BROWSER_GEOLOCATION',
        });
      },
      (err) => {
        reject(new Error(`Gagal membaca lokasi browser: ${err.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Captures a site photo using device camera or gallery for survey evidence.
 */
export async function captureSitePhoto(source: 'CAMERA' | 'PHOTOS' = 'CAMERA'): Promise<NativePhotoResult> {
  if (isNativeMobile()) {
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source === 'CAMERA' ? CameraSource.Camera : CameraSource.Photos,
      });

      return {
        base64Data: image.base64String ? `data:image/${image.format};base64,${image.base64String}` : undefined,
        webPath: image.webPath,
        format: image.format,
        timestamp: Date.now(),
      };
    } catch (nativeErr) {
      throw new Error(`Gagal mengambil foto: ${(nativeErr as Error).message}`);
    }
  }

  throw new Error('Fitur kamera native hanya aktif di aplikasi Android / iOS.');
}

/**
 * Shares survey diagnosis or quotation payload using native system share dialog (WhatsApp, Email, etc.).
 */
export async function shareSurveyPayload(payload: NativeSharePayload): Promise<boolean> {
  if (isNativeMobile()) {
    try {
      await Share.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
        dialogTitle: payload.dialogTitle ?? 'Bagikan Hasil Survei Hycare',
      });
      return true;
    } catch (err) {
      console.warn('[NativeBridge] Share cancelled or failed:', err);
      return false;
    }
  }

  // Web fallback: navigator.share
  if (typeof window !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });
      return true;
    } catch (err) {
      console.warn('[NativeBridge] Web Share error:', err);
      return false;
    }
  }

  // Fallback to clipboard
  if (typeof window !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(`${payload.text}\n${payload.url ?? ''}`.trim());
    return true;
  }

  return false;
}

