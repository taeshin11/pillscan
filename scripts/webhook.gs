/**
 * PillScan - Google Apps Script Webhook
 *
 * SETUP:
 * 1. Go to https://script.google.com → New Project
 * 2. Paste this code
 * 3. Create a Google Sheet and paste its ID in SHEET_ID below
 * 4. Click Deploy → New Deployment → Web App → Execute as Me → Anyone
 * 5. Copy the Web App URL and add it to Vercel: GOOGLE_SHEETS_WEBHOOK_URL
 */

const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "PillScan Data";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME)
      || SpreadsheetApp.openById(SHEET_ID).insertSheet(SHEET_NAME);

    // Add headers if first row is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Drug Name", "Shape", "Color", "Imprint",
        "Confidence", "User Consented"
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.drugName || "",
      data.shape || "",
      data.color || "",
      data.imprint || "",
      data.confidence || 0,
      data.userConsented ? "YES" : "NO"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "PillScan webhook active" }))
    .setMimeType(ContentService.MimeType.JSON);
}
