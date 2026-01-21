/**
 * Camera Service
 * Handles all camera operations using Capacitor Camera
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Take a picture with the camera
 * @returns {Promise<{base64: string, format: string}>}
 */
export const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });
    
    return {
      base64: image.base64String,
      format: image.format
    };
  } catch (error) {
    console.error('Error taking picture:', error);
    throw error;
  }
};

/**
 * Pick an image from the gallery
 * @returns {Promise<{base64: string, format: string}>}
 */
export const pickFromGallery = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos
    });
    
    return {
      base64: image.base64String,
      format: image.format
    };
  } catch (error) {
    console.error('Error picking from gallery:', error);
    throw error;
  }
};

/**
 * Check camera permissions
 * @returns {Promise<boolean>}
 */
export const checkPermissions = async () => {
  try {
    const permissions = await Camera.checkPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch {
    return false;
  }
};

/**
 * Request camera permissions
 * @returns {Promise<boolean>}
 */
export const requestPermissions = async () => {
  try {
    const permissions = await Camera.requestPermissions();
    return permissions.camera === 'granted' && permissions.photos === 'granted';
  } catch {
    return false;
  }
};
