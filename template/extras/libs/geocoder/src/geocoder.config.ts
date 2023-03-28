import { registerAs } from '@nestjs/config';

export default registerAs('geocoder', () => ({
  provider: 'google',
  apiKey: process.env.GOOGLE_MAP_API_KEY,
}));
