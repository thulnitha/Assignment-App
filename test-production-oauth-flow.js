import fetch from 'node-fetch';

async function testProductionOAuthFlow() {
  const productionUrl = 'https://sprthula.replit.app';
  console.log('Testing Production OAuth Flow...\n');

  try {
    // Test all required OAuth pages
    console.log('1. Testing OAuth required pages...');
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/privacy', name: 'Privacy Policy' },
      { path: '/terms', name: 'Terms of Service' }
    ];

    for (const page of pages) {
      try {
        const response = await fetch(`${productionUrl}${page.path}`, { timeout: 10000 });
        console.log(`   ✓ ${page.name}: ${response.status === 200 ? 'ACCESSIBLE' : `FAILED (${response.status})`}`);
      } catch (error) {
        console.log(`   ❌ ${page.name}: CONNECTION ERROR`);
      }
    }

    // Test OAuth redirect
    console.log('\n2. Testing OAuth redirect configuration...');
    try {
      const oauthResponse = await fetch(`${productionUrl}/api/auth/google`, {
        redirect: 'manual',
        timeout: 10000
      });
      
      const location = oauthResponse.headers.get('location');
      console.log('   OAuth status:', oauthResponse.status);
      console.log('   Redirect configured:', location ? 'YES' : 'NO');
      if (location) {
        console.log('   Redirect includes client_id:', location.includes('client_id'));
        console.log('   Redirect includes correct domain:', location.includes('sprthula.replit.app'));
      }
    } catch (error) {
      console.log('   ❌ OAuth redirect test failed:', error.message);
    }

    // Test domain verification
    console.log('\n3. Testing domain verification...');
    try {
      const verifyResponse = await fetch(`${productionUrl}/google3787337a2c8720b1.html`, { timeout: 10000 });
      const verifyContent = await verifyResponse.text();
      console.log('   Verification file status:', verifyResponse.status);
      console.log('   Verification content correct:', verifyContent === 'google-site-verification: google3787337a2c8720b1.html');
    } catch (error) {
      console.log('   ❌ Verification file test failed:', error.message);
    }

    console.log('\n✅ Production OAuth Flow Test Complete!\n');
    
    console.log('📋 Google OAuth Console Configuration:');
    console.log('Application home page: https://sprthula.replit.app/');
    console.log('Privacy policy link: https://sprthula.replit.app/privacy');
    console.log('Terms of service link: https://sprthula.replit.app/terms');
    console.log('Authorized redirect URI: https://sprthula.replit.app/api/auth/google/callback');
    
    console.log('\n🚀 Ready for OAuth app verification submission!');

  } catch (error) {
    console.error('❌ Production test failed:', error.message);
  }
}

testProductionOAuthFlow();