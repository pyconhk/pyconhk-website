import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const EVENT_TIMEZONE = 'Asia/Hong_Kong';
const SHEET_NAME = 'Registration'; // The name of the sheet/tab in your spreadsheet

const ALLOWED_TICKETS_FIRST_WINDOW = [
  'PyCon HK 2024 T-shirt ($100)',
  'Day 1 General Admission + T-shirt ($220)',
  'Day 1 General Admission ($100, No T-shirt)',
  'Day 1 General Admission + T-shirt ($1000)',
  'Speaker (Free T-shirt)',
];

const ALLOWED_TICKETS_SECOND_WINDOW = [
  'Day 1 General Admission',
  'Volunteer (Free T-shirt)',
  ...ALLOWED_TICKETS_FIRST_WINDOW,
];

interface Attendee {
  barcode: string;
  name: string;
  ticketType: string;
  orderId: string; // NEW: To group tickets by order
  redeemStatus?: string;
  rowIndex: number;
}

interface VerificationResponse {
  status: 'success' | 'error' | 'warning';
  data?: {
    name: string;
    ticketTypes: string[];
  };
  message: string;
}

const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n'
      ),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Read and Write scope
  }),
});

// Cache the data to avoid hitting the API on every scan
let cachedData: Attendee[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

let headerMap: { [key: string]: number } = {}; // To store column indices

// Helper to convert a 0-based column index to a sheet column letter (A, B, C...)
function columnIndexToLetter(column: number): string {
  let temp,
    letter = '';
  while (column >= 0) {
    temp = column % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = Math.floor(column / 26) - 1;
  }
  return letter;
}

async function getSheetData(): Promise<Attendee[]> {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_DURATION && cachedData.length > 0) {
    console.log('Serving from cache');
    return cachedData;
  }

  console.log('Fetching fresh data from Google Sheets');
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: SHEET_NAME,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in spreadsheet.');
    }

    const headers = rows[0].map((h: string) => h.trim());
    const barcodeIndex = headers.indexOf('Barcode number');
    const firstNameIndex = headers.indexOf('Attendee first name');
    const lastNameIndex = headers.indexOf('Attendee last name');
    const ticketTypeIndex = headers.indexOf('Ticket type');
    const redeemStatusIndex = headers.indexOf('Redeem Status');
    const orderIdIndex = headers.indexOf('Order ID'); // NEW: Get the Order ID column index

    if (
      barcodeIndex === -1 ||
      firstNameIndex === -1 ||
      ticketTypeIndex === -1 ||
      redeemStatusIndex === -1 ||
      orderIdIndex === -1 // NEW: Check for Order ID column
    ) {
      throw new Error(
        "Could not find required columns. Ensure 'Barcode number', 'Attendee first name', 'Ticket type', 'Redeem Status', and 'Order ID' exist."
      );
    }

    // Store header indices for later use (e.g., writing back)
    headerMap = {
      redeemStatusIndex: redeemStatusIndex,
    };

    cachedData = rows
      .slice(1)
      .map((row: any[], index: number): Attendee | null => {
        const barcode = row[barcodeIndex];
        if (!barcode) return null; // Skip rows without a barcode

        return {
          barcode: barcode.toString(),
          name: `${row[firstNameIndex] || ''} ${
            row[lastNameIndex] || ''
          }`.trim(),
          ticketType: row[ticketTypeIndex] || 'N/A',
          orderId: row[orderIdIndex] || `NO_ORDER_ID_${barcode}`, // NEW: Store Order ID
          redeemStatus: row[redeemStatusIndex] || '', // Get redeem status, default to empty string
          rowIndex: index + 2, // +1 for 0-based index, +1 for skipping header row
        };
      })
      .filter((item): item is Attendee => item !== null);

    lastFetchTime = now;
    return cachedData;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    if (cachedData.length > 0) return cachedData; // Return stale cache if fetch fails
    throw error;
  }
}

async function batchUpdateRedeemStatus(
  rowsToUpdate: Attendee[],
  value: string
) {
  if (rowsToUpdate.length === 0) {
    console.log('No rows to update.');
    return;
  }

  try {
    const redeemStatusColumnLetter = columnIndexToLetter(
      headerMap.redeemStatusIndex
    );

    // Prepare the data for the batch update request
    const data = rowsToUpdate.map(attendee => ({
      range: `${SHEET_NAME}!${redeemStatusColumnLetter}${attendee.rowIndex}`,
      values: [[value]],
    }));

    console.log(`Batch updating ${data.length} cells with value: "${value}"`);

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: data,
      },
    });

    // Invalidate cache after successful batch write
    lastFetchTime = 0;
    cachedData = [];
    console.log('Cache invalidated after batch update.');
  } catch (error) {
    console.error(`Failed to batch update sheet:`, error);
    // Log the error but don't throw, as the user experience was a success.
  }
}

export async function POST(request: Request) {
  try {
    const { barcode } = await request.json();

    if (!barcode) {
      return NextResponse.json(
        { status: 'error', message: 'Barcode is required.' },
        { status: 400 }
      );
    }

    const attendees = await getSheetData();
    const attendee = attendees.find(a => a.barcode === barcode);

    // 1. Check if the attendee exists
    if (!attendee) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Invalid Barcode: Ticket not found in the system.',
        },
        { status: 404 }
      );
    }

    const attendeeRelatedTickets = attendees.filter(
      a => a.orderId === attendee.orderId
    );

    // 2. Check if the ticket has already been redeemed
    for (const t of attendeeRelatedTickets) {
      if (t.redeemStatus && t.redeemStatus.trim() !== '') {
        return NextResponse.json(
          {
            status: 'warning',
            message: `Already Redeemed`,
            details: `This ticket was already redeemed on ${t.redeemStatus}.`,
            data: {
              name: t.name,
              ticketTypes: attendeeRelatedTickets.map(t => t.ticketType),
            },
          },
          { status: 200 }
        );
      }
    }

    // 3. Perform time-based checks with detailed logging
    const now = new Date();
    const eventTime = new Date(
      now.toLocaleString('en-US', { timeZone: EVENT_TIMEZONE })
    );

    const currentHour = eventTime.getHours();
    const currentMinute = eventTime.getMinutes();
    const currentTime = currentHour + currentMinute / 60; // e.g., 2:30pm is 14.5

    // For logging purposes
    const formattedCurrentTime = eventTime.toLocaleTimeString('en-US', {
      timeZone: EVENT_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let canRedeem = false;

    // Time window 1: 2:00pm (14.0) to 3:30pm (15.5)
    if (currentTime >= 14.0 && currentTime < 15.5) {
      for (const t of attendeeRelatedTickets) {
        if (ALLOWED_TICKETS_FIRST_WINDOW.includes(t.ticketType)) {
          canRedeem = true;
          break;
        }
      }
    }
    // Time window 2: 3:30pm (15.5) to 6:00pm (18.0)
    else if (currentTime >= 15.5 && currentTime < 18.0) {
      for (const t of attendeeRelatedTickets) {
        if (ALLOWED_TICKETS_SECOND_WINDOW.includes(t.ticketType)) {
          canRedeem = true;
          break;
        }
      }
    }

    // --- DETAILED ERROR LOGIC ---
    if (!canRedeem) {
      let reason = '';
      let validWindow = '';

      // Determine the correct valid window for this ticket type to display in the error
      const allTicketTypes = attendeeRelatedTickets.map(t => t.ticketType);
      const firstWindowTickets = allTicketTypes.filter(t =>
        ALLOWED_TICKETS_FIRST_WINDOW.includes(t)
      );
      const secondWindowTickets = allTicketTypes.filter(t =>
        ALLOWED_TICKETS_SECOND_WINDOW.includes(t)
      );

      if (firstWindowTickets.length == 0 && secondWindowTickets.length > 0) {
        validWindow = 'Valid from 3:30 PM - 6:00 PM.';
      } else if (
        secondWindowTickets.length == 0 &&
        firstWindowTickets.length > 0
      ) {
        validWindow = 'Valid from 2:00 PM - 6:00 PM.';
      } else {
        validWindow =
          'This ticket type does not have a configured redemption window.';
      }

      if (currentTime < 14.0) {
        reason = `Too Early. Redemption has not opened yet.`;
      } else if (currentTime >= 18.0) {
        reason = `Too Late. Redemption for today has closed.`;
      } else {
        reason = `Incorrect Time Window.`;
      }

      return NextResponse.json(
        {
          status: 'error',
          message: reason,
          details: `Scan Time: ${formattedCurrentTime}. ${validWindow}`,
          data: { name: attendee.name, ticketTypes: allTicketTypes },
        },
        { status: 403 } // 403 Forbidden is appropriate
      );
    }

    const orderIdToRedeem = attendee.orderId;
    const redemptionTimestamp = new Date()
      .toLocaleString('en-CA', { timeZone: EVENT_TIMEZONE, hour12: false })
      .replace(',', '');

    // Find all attendees in the same order who have not been redeemed yet.
    const allTicketsInOrderToUpdate = attendees.filter(
      a =>
        a.orderId === orderIdToRedeem &&
        (!a.redeemStatus || a.redeemStatus.trim() === '')
    );

    if (allTicketsInOrderToUpdate.length > 0) {
      // Call the new batch update function
      await batchUpdateRedeemStatus(
        allTicketsInOrderToUpdate,
        redemptionTimestamp
      );
    }

    const response: VerificationResponse = {
      status: 'success',
      message: 'Redemption Successful!',
      data: {
        name: attendee.name,
        ticketTypes: attendeeRelatedTickets.map(t => t.ticketType),
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'An internal server error occurred.',
      },
      { status: 500 }
    );
  }
}
