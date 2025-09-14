import { NextResponse } from "next/server";
import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_ID = process.env.SHEET_ID;

async function getAuth(): Promise<JWT> {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!process.env.GOOGLE_CLIENT_EMAIL || !privateKey) {
    throw new Error("Missing Google service account credentials");
  }

  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: SCOPES,
  });
}

async function appendRowToSheet(
  fullName: string,
  address: string,
  role: string,
  company: string,
  use: string
) {
  try {
    const authClient = await getAuth();
    const sheets: sheets_v4.Sheets = google.sheets({
      version: "v4",
      auth: authClient,
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:E", 
      valueInputOption: "RAW",
      requestBody: {
        values: [[fullName, address, role, company, use]],
      },
    });
  } catch (error) {
    console.error("Failed to append row to Google Sheets:", error);
    throw new Error("Google Sheets API request failed");
  }
}

export async function POST(req: Request) {
  try {
    const { fullName, address, role, company, use } = await req.json();

    if (!fullName || !address || !role || !company || !use) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await appendRowToSheet(fullName, address, role, company, use);
    return NextResponse.json(
      { message: "Row added successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding row:", error);
    return NextResponse.json({ error: "Failed to add row" }, { status: 500 });
  }
}
