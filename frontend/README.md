TownDrop - Expo React Native Frontend

Quick start:

1. Install Node and Expo CLI (or use npx):
   npm install -g expo-cli

2. Install dependencies:
   npm install

3. Start the app:
   npm start

Notes:
- API base is set to http://10.0.2.2:8000 (Android emulator). For physical device change API_BASE in src/services/api.js to your machine IP.
- Backend endpoints expected:
  - POST /auth/register
  - POST /auth/token (OAuth2 token endpoint expects form 'username' + 'password')
  - GET /catalog/categories
  - GET /catalog/products?category_id=&q=
  - POST /orders (requires Bearer token)
  - GET /orders (requires Bearer token)
