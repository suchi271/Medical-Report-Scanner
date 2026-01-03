const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'medical-scanner-app.firebasestorage.app'
});

async function testUploadAndProcess() {
  try {
    console.log('🔄 Starting test upload...\n');
    
    // Read the PDF file
    const pdfPath = path.join(__dirname, 'bloodtestreport.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log(`✅ Read PDF file: ${pdfPath} (${pdfBuffer.length} bytes)\n`);
    
    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `users/test-user/reports/test-report-${Date.now()}.pdf`;
    const file = bucket.file(fileName);
    
    console.log(`🔄 Uploading to Storage: ${fileName}...`);
    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf'
      }
    });
    console.log('✅ Upload successful!\n');
    
    // Get the download URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log(`📄 File URL: ${publicUrl}\n`);
    
    // Create a test user token (you'll need to replace with real auth)
    // For now, we'll just call the function directly without auth
    console.log('🔄 Calling processReport function...\n');
    
    const response = await axios.post(
      'http://127.0.0.1:5001/medical-scanner-app/us-central1/api/processReport',
      {
        pdfUri: `gs://${bucket.name}/${fileName}`,
        userId: 'test-user'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token-for-testing'
        }
      }
    );
    
    console.log('✅ Function response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('Stack:', error.stack);
  }
}

testUploadAndProcess();
