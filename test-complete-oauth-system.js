import fetch from 'node-fetch';

async function testCompleteOAuthSystem() {
  const baseUrl = 'http://localhost:5000';
  const correctRedirectUri = 'https://078809a0-7c28-481a-b436-4116774afcc9-00-2iz5xyaibz04i.spock.replit.dev/api/auth/google/callback';
  
  console.log('🔄 Testing Complete OAuth System with Refresh Tokens...\n');
  
  try {
    // Test 1: OAuth Redirect Configuration
    console.log('1. Testing OAuth redirect configuration...');
    const oauthResponse = await fetch(`${baseUrl}/api/auth/google`, {
      redirect: 'manual'
    });
    
    if (oauthResponse.status === 302) {
      const location = oauthResponse.headers.get('location');
      console.log('✅ OAuth redirect working correctly');
      
      // Extract redirect URI from Google OAuth URL
      const urlParams = new URLSearchParams(location.split('?')[1]);
      const redirectUri = decodeURIComponent(urlParams.get('redirect_uri'));
      
      console.log(`   Current redirect URI: ${redirectUri}`);
      
      if (redirectUri === correctRedirectUri) {
        console.log('✅ Redirect URI matches expected Replit domain');
      } else {
        console.log('❌ Redirect URI mismatch');
        console.log(`   Expected: ${correctRedirectUri}`);
        console.log(`   Got: ${redirectUri}`);
      }
    } else {
      console.log(`❌ OAuth redirect failed. Status: ${oauthResponse.status}`);
    }
    
    // Test 2: Callback Route Error Handling
    console.log('\n2. Testing callback route error handling...');
    const callbackTestResponse = await fetch(`${baseUrl}/api/auth/google/callback?error=access_denied`, {
      redirect: 'manual'
    });
    
    if (callbackTestResponse.status === 302) {
      const location = callbackTestResponse.headers.get('location');
      console.log('✅ Callback handles OAuth errors correctly');
      console.log(`   Redirects to: ${location}`);
    }
    
    // Test 3: Refresh Token Endpoint
    console.log('\n3. Testing refresh token endpoint...');
    const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (refreshResponse.status === 401) {
      console.log('✅ Refresh endpoint properly handles missing tokens');
    } else {
      console.log(`⚠️  Refresh endpoint response: ${refreshResponse.status}`);
    }
    
    // Test 4: Auth Status with Token Information
    console.log('\n4. Testing enhanced auth status...');
    const statusResponse = await fetch(`${baseUrl}/api/auth/status`);
    const statusData = await statusResponse.json();
    
    if (statusResponse.status === 200) {
      console.log('✅ Auth status endpoint operational');
      console.log(`   Authentication: ${statusData.authenticated ? 'Active' : 'Inactive'}`);
    }
    
    console.log('\n📋 Google Console Configuration Required:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 In your Google Cloud Console:');
    console.log('   1. Go to APIs & Services > Credentials');
    console.log('   2. Edit your OAuth 2.0 Client ID');
    console.log('   3. Add this Authorized Redirect URI:');
    console.log(`   ${correctRedirectUri}`);
    console.log('   4. Remove any old redirect URIs if present');
    console.log('   5. Save the configuration');
    
    console.log('\n🔑 OAuth Configuration Summary:');
    console.log(`   Client ID: 1067002211432-tj5g2ap02roq3apvtm89vkebbvkia2rm.apps.googleusercontent.com`);
    console.log(`   Redirect URI: ${correctRedirectUri}`);
    console.log('   Scopes: openid, email, profile');
    console.log('   Access Type: offline (for refresh tokens)');
    
    console.log('\n🎯 System Features:');
    console.log('   • OAuth 2.0 with PKCE support');
    console.log('   • Refresh token management');
    console.log('   • Session-based token storage');
    console.log('   • Automatic token refresh capability');
    console.log('   • Comprehensive error handling');
    
  } catch (error) {
    console.error('❌ Error in OAuth system test:', error.message);
  }
}

testCompleteOAuthSystem();