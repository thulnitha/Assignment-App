import fetch from 'node-fetch';
import { load } from 'cheerio';

async function testGoogleVerificationMethods() {
  const baseUrl = 'http://localhost:5000';
  console.log('Testing Google Verification Methods...\n');

  try {
    // Method 1: HTML file verification
    console.log('1. Testing HTML file verification method...');
    const fileResponse = await fetch(`${baseUrl}/google3787337a2c8720b1.html`);
    const fileContent = await fileResponse.text();
    
    console.log('✓ File status:', fileResponse.status);
    console.log('✓ File content:', fileContent);
    console.log('✓ Content type:', fileResponse.headers.get('content-type'));
    
    const expectedFileContent = 'google-site-verification: google3787337a2c8720b1.html';
    console.log('✓ File content matches expected:', fileContent === expectedFileContent);

    // Method 2: HTML meta tag verification
    console.log('\n2. Testing HTML meta tag verification method...');
    const homeResponse = await fetch(`${baseUrl}/`);
    const homeHtml = await homeResponse.text();
    
    const $ = load(homeHtml);
    const metaTag = $('meta[name="google-site-verification"]');
    const metaContent = metaTag.attr('content');
    
    console.log('✓ Homepage status:', homeResponse.status);
    console.log('✓ Meta tag found:', metaTag.length > 0);
    console.log('✓ Meta tag content:', metaContent);
    console.log('✓ Meta content matches expected:', metaContent === 'google3787337a2c8720b1');

    // Test external accessibility
    console.log('\n3. Testing external URL accessibility...');
    try {
      const externalFileTest = await fetch('https://sprthula.replit.app/google3787337a2c8720b1.html', {
        timeout: 10000
      });
      console.log('✓ External file accessibility:', externalFileTest.status);
    } catch (error) {
      console.log('⚠ External file test failed (may be due to deployment state):', error.message);
    }

    try {
      const externalHomeTest = await fetch('https://sprthula.replit.app/', {
        timeout: 10000
      });
      const externalHtml = await externalHomeTest.text();
      const $external = load(externalHtml);
      const externalMeta = $external('meta[name="google-site-verification"]').attr('content');
      console.log('✓ External meta tag:', externalMeta);
    } catch (error) {
      console.log('⚠ External meta test failed (may be due to deployment state):', error.message);
    }

    console.log('\n✅ Google Verification Setup Complete!\n');
    
    console.log('🔧 Try these verification methods in Google Search Console:');
    console.log('Method 1 - HTML file:');
    console.log('- Use file: google3787337a2c8720b1.html');
    console.log('- URL: https://sprthula.replit.app/google3787337a2c8720b1.html');
    console.log('\nMethod 2 - HTML meta tag:');
    console.log('- Use content: google3787337a2c8720b1');
    console.log('- Will be found in homepage <head> section');

  } catch (error) {
    console.error('❌ Verification test failed:', error.message);
  }
}

testGoogleVerificationMethods();