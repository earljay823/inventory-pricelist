'use server'
import { google } from 'googleapis';

export async function getProducts() {
  try {
    // 1. Safety Check: Are the keys actually loading?
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      console.error("🚨 ERROR: Missing GOOGLE_SERVICE_ACCOUNT_EMAIL");
      return [];
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      console.error("🚨 ERROR: Missing GOOGLE_PRIVATE_KEY");
      return [];
    }

    // 2. Build the ID Badge
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        // This makes sure the line breaks in your key are read correctly
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // 3. Fetch the data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'MASTER_SHEET!A2:F1000', 
    });

    return response.data.values || [];
  } catch (error: any) {
    // This will print the exact reason Google rejected the badge
    console.error("🚨 Google Sheets Error:", error.message);
    return [];
  }
}
