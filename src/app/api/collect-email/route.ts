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

    // Add timestamp and additional metadata
    const timestamp = new Date().toISOString();
    const source = 'Xleos AI Studio';

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A:G", // Extended to include timestamp and source
      valueInputOption: "RAW",
      requestBody: {
        values: [[fullName, address, role, company, use, timestamp, source]],
      },
    });

    console.log(`✅ Added waitlist entry: ${fullName} (${address})`);
  } catch (error) {
    console.error("Failed to append row to Google Sheets:", error);
    throw new Error("Google Sheets API request failed");
  }
}

export async function POST(req: Request) {
  try {
    const { fullName, address, role, company, use } = await req.json();

    // Validation
    if (!fullName || !address || !role || !use) {
      return NextResponse.json(
        { error: "Full name, email, role, and use case are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(address)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Content validation
    if (fullName.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (use.length < 10) {
      return NextResponse.json(
        { error: "Please provide more details about how you plan to use Xleos" },
        { status: 400 }
      );
    }

    await appendRowToSheet(
      fullName.trim(),
      address.trim().toLowerCase(),
      role,
      company?.trim() || '',
      use.trim()
    );

    return NextResponse.json(
      { 
        message: "Successfully added to waitlist",
        data: {
          name: fullName,
          email: address,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding to waitlist:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("Google Sheets")) {
        return NextResponse.json(
          { error: "Failed to save to waitlist. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
