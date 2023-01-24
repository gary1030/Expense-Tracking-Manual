import { google } from 'googleapis';
import { timeStampToDate, getYear, getMonth, getDate } from './timeConverter';

export async function getSpendingList() {
  try {
    const target = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const jwt = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      "",
      (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      target
    );

    const sheets = google.sheets({ version: 'v4', auth: jwt });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'test', // sheet name
    });

    const rows = response.data.values;
    return rows
  } catch (err) {
    console.log(err);
  }
  return [];
}

export async function saveExpense(userId: string, timeStamp: number, expense: string, amount: number) {
  try {
    const target = ['https://www.googleapis.com/auth/spreadsheets'];
    const jwt = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      "",
      (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      target
    );

    const sheets = google.sheets({ version: 'v4', auth: jwt });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'test', // sheet name
      valueInputOption: 'RAW',
      requestBody: {
        majorDimension: 'ROWS',
        range: 'test',
        values: [[userId, timeStamp, timeStampToDate(timeStamp), expense, amount, getYear(timeStamp), getMonth(timeStamp), getDate(timeStamp), "cost"]],
      },
    }); 
  } catch (err) {
    console.log(err);
  }     
}  