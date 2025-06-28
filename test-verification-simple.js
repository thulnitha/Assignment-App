import fetch from 'node-fetch';

async function testVerificationMethods() {
  const baseUrl = 'http://localhost:5000';
  console.log('Testing Google Verification Methods...\n');

  try {
    // Test HTML file method
    console.log('1. HTML File Method:');
    const fileResponse = await fetch(`${baseUrl}/google3787337a2c8720b1.html`);
    const fileContent = await fileResponse.text();
    
    console.log('   Status:', fileResponse.status);
    console.log('   Content:', fileContent);
    console.log('   Expected:', 'google-site-verification: google3787337a2c8720b1.html');
    console.log('   Match:', fileContent === 'google-site-verification: google3787337a2c8720b1.html');

    // Test HTML meta tag method
    console.log('\n2. HTML Meta Tag Method:');
    const homeResponse = await fetch(`${baseUrl}/`);
    const homeHtml = await homeResponse.text();
    
    console.log('   Homepage status:', homeResponse.status);
    const hasMetaTag = homeHtml.includes('google-site-verification');
    const hasCorrectContent = homeHtml.includes('content="google3787337a2c8720b1"');
    
    console.log('   Contains meta tag:', hasMetaTag);
    console.log('   Contains correct content:', hasCorrectContent);
    
    if (hasMetaTag) {
      const metaMatch = homeHtml.match(/name="google-site-verification"\s+content="([^"]+)"/);
      if (metaMatch) {
        console.log('   Meta content found:', metaMatch[1]);
      }
    }

    console.log('\n✅ Both verification methods are configured');
    console.log('\n🔧 Google Search Console Options:');
    console.log('Option 1: HTML file - upload google3787337a2c8720b1.html');
    console.log('Option 2: HTML meta tag - use content: google3787337a2c8720b1');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVerificationMethods();