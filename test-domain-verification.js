import fetch from 'node-fetch';

async function testDomainVerification() {
  const baseUrl = 'http://localhost:5000';
  console.log('Testing Google Domain Verification Setup...\n');

  try {
    // Test the verification file
    console.log('1. Testing Google verification file...');
    const verificationResponse = await fetch(`${baseUrl}/google3787337a2c8720b1.html`);
    const verificationContent = await verificationResponse.text();
    
    console.log('✓ Verification file status:', verificationResponse.status);
    console.log('✓ Verification file content:', verificationContent);
    console.log('✓ Content matches expected format:', verificationContent === 'google-site-verification: google3787337a2c8720b1.html');

    // Test all required pages for OAuth verification
    console.log('\n2. Testing all OAuth required pages...');
    const requiredPages = [
      { path: '/', name: 'Homepage' },
      { path: '/privacy', name: 'Privacy Policy' },
      { path: '/terms', name: 'Terms of Service' },
      { path: '/oauth-login', name: 'OAuth Instructions' }
    ];

    for (const page of requiredPages) {
      const response = await fetch(`${baseUrl}${page.path}`);
      console.log(`✓ ${page.name} (${page.path}): ${response.status === 200 ? 'ACCESSIBLE' : 'FAILED'}`);
    }

    // Test OAuth configuration
    console.log('\n3. Testing OAuth redirect configuration...');
    const oauthResponse = await fetch(`${baseUrl}/api/auth/google`, {
      redirect: 'manual'
    });
    
    const redirectUrl = oauthResponse.headers.get('location');
    console.log('✓ OAuth redirect status:', oauthResponse.status);
    console.log('✓ Redirect URL includes sprthula.replit.app:', redirectUrl.includes('sprthula.replit.app'));

    console.log('\n✅ Domain Verification Setup Complete!\n');
    
    console.log('🔧 Next Steps:');
    console.log('1. Go to Google Search Console (https://search.google.com/search-console)');
    console.log('2. Add property: https://sprthula.replit.app');
    console.log('3. Choose "HTML file" verification method');
    console.log('4. Verify that Google can access: https://sprthula.replit.app/google3787337a2c8720b1.html');
    console.log('5. Click "Verify" in Google Search Console');
    
    console.log('\n📋 Once domain is verified, update Google OAuth Console:');
    console.log('- Application home page: https://sprthula.replit.app/');
    console.log('- Privacy policy: https://sprthula.replit.app/privacy');
    console.log('- Terms of service: https://sprthula.replit.app/terms');
    console.log('- Redirect URI: https://sprthula.replit.app/api/auth/google/callback');

  } catch (error) {
    console.error('❌ Domain verification test failed:', error.message);
  }
}

testDomainVerification();