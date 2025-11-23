# Environment Configuration

This file contains instructions for setting up your Gemini API key.

## Setup Instructions

1. Get your Gemini API key from: https://makersuite.google.com/app/apikey

2. Open `src/environments/environment.ts` (for development)

3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key:
   ```typescript
   export const environment = {
     production: false,
     geminiApiKey: 'your-actual-api-key-here'
   };
   ```

4. For production deployment, also update `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     geminiApiKey: 'your-actual-api-key-here'
   };
   ```

## Security Notes

- **Never commit your API key to version control!**
- Add `src/environments/environment*.ts` to `.gitignore` if deploying publicly
- For production apps, consider using backend API endpoints instead of exposing keys in frontend code

## Testing

After adding your API key:
1. Run `npm start`
2. Open the AI chat interface
3. Try adding an expense like "Spent 500 on lunch"
