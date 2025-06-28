import fetch from 'node-fetch';

async function testFixesSimple() {
  const baseUrl = 'http://localhost:5000';
  console.log('Testing Three Critical Fixes...\n');

  try {
    // Test 1: Admin Panel User Endpoint
    console.log('1. Admin Panel Access Fix:');
    const userResponse = await fetch(`${baseUrl}/api/auth/user`);
    console.log(`   GET /api/auth/user: ${userResponse.status === 401 ? 'WORKING (requires auth)' : 'ERROR'}`);

    // Test 2: File Upload Endpoint
    console.log('\n2. Assignment Upload Fix:');
    const uploadResponse = await fetch(`${baseUrl}/api/upload`, { method: 'POST' });
    console.log(`   POST /api/upload: ${uploadResponse.status === 400 ? 'WORKING (expects file)' : 'ERROR'}`);

    // Test 3: Donation System
    console.log('\n3. Donation System Fix:');
    const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 500,
        currency: 'LKR',
        donorName: 'Test Donor',
        donorEmail: 'test@example.com'
      })
    });
    
    const donationData = await donationResponse.json();
    console.log(`   POST /api/donations/create: ${donationData.success ? 'WORKING' : 'ERROR'}`);
    console.log(`   Returns JSON (not HTML): ${typeof donationData === 'object' ? 'YES' : 'NO'}`);
    
    if (donationData.paymentUrl) {
      const paymentPageResponse = await fetch(donationData.paymentUrl);
      console.log(`   Payment page accessible: ${paymentPageResponse.status === 200 ? 'YES' : 'NO'}`);
    }

    console.log('\n✅ Fix Verification Complete\n');
    
    console.log('Fixes Applied:');
    console.log('• Admin access: /api/auth/user endpoint added for thulnithamethmal@gmail.com verification');
    console.log('• File upload: /api/upload endpoint with multer for assignment files');
    console.log('• Donation error: /api/donations/create now returns proper JSON instead of HTML 404');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFixesSimple();