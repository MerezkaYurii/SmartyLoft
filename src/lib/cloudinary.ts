import { v2 as cloudinary } from 'cloudinary';
import { getEnvVar } from '../utils/getEnvVar';

// Настраиваем конфигурацию Cloudinary
cloudinary.config({
  cloud_name: getEnvVar('CLOUDINARY_CLOUD_NAME'),
  api_key: getEnvVar('CLOUDINARY_API_KEY'),
  api_secret: getEnvVar('CLOUDINARY_API_SECRET'),
  secure: true, // Использовать только HTTPS
});

export default cloudinary;