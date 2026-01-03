// Test BigQuery endpoint
// Run with: node test-bigquery.js

const FUNCTIONS_URL = "https://us-central1-medical-scanner-app.cloudfunctions.net/api";

async function testEndpoint() {
  console.log("Testing BigQuery endpoint...\n");
  
  // You'll need to replace these with actual values from your app:
  const REPORT_ID = "YOUR_REPORT_ID"; // Get from Firebase console
  const AUTH_TOKEN = "YOUR_AUTH_TOKEN"; // Get from browser dev tools
  
  if (REPORT_ID === "YOUR_REPORT_ID") {
    console.log("❌ Please update REPORT_ID in this script");
    console.log("\nTo get your report ID:");
    console.log("1. Go to Firebase Console → Firestore");
    console.log("2. Navigate to users → [your-uid] → reports");
    console.log("3. Copy a report document ID\n");
    return;
  }
  
  if (AUTH_TOKEN === "YOUR_AUTH_TOKEN") {
    console.log("❌ Please update AUTH_TOKEN in this script");
    console.log("\nTo get your auth token:");
    console.log("1. Open https://medical-scanner-app.web.app");
    console.log("2. Login");
    console.log("3. Open Developer Tools (F12)");
    console.log("4. Go to Console tab");
    console.log("5. Run: firebase.auth().currentUser.getIdToken().then(t => console.log(t))");
    console.log("6. Copy the token\n");
    return;
  }
  
  try {
    const url = `${FUNCTIONS_URL}/getReportData?reportId=${REPORT_ID}`;
    console.log(`Calling: ${url}\n`);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log("\nResponse:");
    console.log(JSON.stringify(data, null, 2));
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`\n✅ SUCCESS! Found ${data.length} test results from BigQuery`);
    } else if (Array.isArray(data) && data.length === 0) {
      console.log("\n⚠️ BigQuery returned empty array");
      console.log("This means either:");
      console.log("1. No data has been inserted for this report yet");
      console.log("2. The report was processed before BigQuery integration was working");
      console.log("\nTry uploading a NEW report to test.");
    } else {
      console.log("\n❌ Unexpected response format");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testEndpoint();
