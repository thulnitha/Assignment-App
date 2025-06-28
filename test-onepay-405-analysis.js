import fetch from 'node-fetch';
import crypto from 'crypto';

async function analyzeOnePay405Error() {
    console.log('OnePay 405 Error Analysis');
    console.log('=========================');

    const baseUrl = 'https://078809a0-7c28-481a-b436-4116774afcc9-00-2iz5xyaibz04i.spock.replit.dev';
    const appId = '26DT119089BDB84D5FF8C';
    const appSecret = 'u74Vb4h3HJkjhgjhg456789VBNMJHGFDS56789MNBVCXZ123456QWERTYUIOPASDFGHJKLZXCVBNM';
    
    try {
        // Step 1: Create a test donation
        console.log('\n1. Creating test donation for 405 analysis...');
        const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 1000,
                currency: 'LKR',
                message: '405 error analysis test',
                donorName: '405 Test User',
                donorEmail: '405test@example.com'
            })
        });

        const donationResult = await donationResponse.json();
        if (!donationResult.success) {
            console.log('Donation creation failed:', donationResult.message);
            return;
        }

        const reference = donationResult.paymentUrl.split('/').pop();
        console.log('Test reference:', reference);

        // Step 2: Test various OnePay submission methods
        console.log('\n2. Testing OnePay submission methods...');

        const amount = 1000;
        const hashString = `${appId}${amount}${reference}${appSecret}`;
        const hashToken = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
        const appToken = `${hashToken.substring(0, 32)}.${appId}`;

        const onePayData = {
            appid: appId,
            amount: amount,
            orderReference: reference,
            customerFirstName: '405',
            customerLastName: 'Test',
            customerEmail: '405test@example.com',
            customerPhoneNumber: '+94771234567',
            transactionRedirectUrl: `${baseUrl}/donation-success`,
            additionalData: `test_405_${Date.now()}`,
            hashToken: hashToken,
            apptoken: appToken
        };

        // Method 1: Direct POST to OnePay (expect 405)
        console.log('\n  Method 1: Direct POST to OnePay...');
        try {
            const directPost = await fetch('https://ipg.onepay.lk/ipg/checkout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'MathsWithThula/1.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                body: new URLSearchParams(onePayData),
                redirect: 'manual'
            });

            console.log('    Status:', directPost.status);
            console.log('    Status Text:', directPost.statusText);
            
            if (directPost.status === 405) {
                console.log('    ❌ 405 Method Not Allowed confirmed');
                console.log('    OnePay blocking direct POST requests');
            } else if (directPost.status === 302) {
                console.log('    ✅ Redirect received - POST accepted');
            }
        } catch (error) {
            console.log('    Error:', error.message);
        }

        // Method 2: GET request to OnePay (test if GET works)
        console.log('\n  Method 2: GET request to OnePay...');
        try {
            const getRequest = await fetch('https://ipg.onepay.lk/ipg/checkout/', {
                method: 'GET',
                headers: {
                    'User-Agent': 'MathsWithThula/1.0'
                }
            });

            console.log('    GET Status:', getRequest.status);
            console.log('    GET works:', getRequest.ok ? 'Yes' : 'No');
        } catch (error) {
            console.log('    GET Error:', error.message);
        }

        // Method 3: Test OnePay with different content types
        console.log('\n  Method 3: Testing different content types...');
        
        const contentTypes = [
            'application/x-www-form-urlencoded',
            'multipart/form-data',
            'text/plain'
        ];

        for (const contentType of contentTypes) {
            try {
                console.log(`    Testing ${contentType}...`);
                const response = await fetch('https://ipg.onepay.lk/ipg/checkout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': contentType,
                        'User-Agent': 'MathsWithThula/1.0'
                    },
                    body: contentType === 'application/x-www-form-urlencoded' 
                        ? new URLSearchParams(onePayData)
                        : JSON.stringify(onePayData),
                    redirect: 'manual'
                });
                
                console.log(`      ${contentType}: ${response.status}`);
            } catch (error) {
                console.log(`      ${contentType}: Error - ${error.message}`);
            }
        }

        // Method 4: Test with browser-like headers
        console.log('\n  Method 4: Testing with browser-like headers...');
        try {
            const browserHeaders = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            };

            const browserRequest = await fetch('https://ipg.onepay.lk/ipg/checkout/', {
                method: 'POST',
                headers: browserHeaders,
                body: new URLSearchParams(onePayData),
                redirect: 'manual'
            });

            console.log('    Browser-like headers status:', browserRequest.status);
        } catch (error) {
            console.log('    Browser-like headers error:', error.message);
        }

        // Step 3: Analyze OnePay documentation compliance
        console.log('\n3. OnePay Integration Analysis...');
        
        console.log('  Required parameters check:');
        const requiredParams = ['appid', 'amount', 'orderReference', 'customerFirstName', 'customerLastName', 'customerEmail', 'hashToken'];
        requiredParams.forEach(param => {
            console.log(`    ${param}: ${onePayData[param] ? '✅' : '❌'}`);
        });

        console.log('  Hash token validation:');
        console.log(`    Generated hash: ${hashToken.substring(0, 20)}...`);
        console.log(`    Hash length: ${hashToken.length} (should be 64)`);
        console.log(`    App token: ${appToken.substring(0, 30)}...`);

        // Step 4: Test HTML form submission method
        console.log('\n4. Testing HTML form submission approach...');
        
        const formHTML = `
        <form action="https://ipg.onepay.lk/ipg/checkout/" method="POST" target="_blank">
            ${Object.entries(onePayData).map(([key, value]) => 
                `<input type="hidden" name="${key}" value="${value}">`
            ).join('\n            ')}
            <input type="submit" value="Pay Now">
        </form>`;

        console.log('  HTML form generated successfully');
        console.log('  Form method: POST (standard HTML)');
        console.log('  Form target: _blank (new window)');

        // Step 5: Alternative solutions for 405 error
        console.log('\n5. Alternative Solutions for 405 Error...');
        
        console.log('  Option A: Pure HTML form submission (recommended)');
        console.log('    - Create form dynamically in JavaScript');
        console.log('    - Submit form programmatically');
        console.log('    - This bypasses CORS and 405 restrictions');

        console.log('  Option B: Server-side proxy');
        console.log('    - Server makes the POST request to OnePay');
        console.log('    - Returns OnePay response to client');
        console.log('    - Client redirects to OnePay URL');

        console.log('  Option C: iFrame integration');
        console.log('    - Load OnePay form in iFrame');
        console.log('    - Handle responses via postMessage');
        console.log('    - Seamless user experience');

        // Step 6: Recommendations
        console.log('\n6. Final Recommendations...');
        console.log('===============================');
        
        console.log('Primary solution: HTML form submission');
        console.log('- OnePay expects traditional HTML form POST');
        console.log('- JavaScript fetch/XMLHttpRequest blocked by CORS');
        console.log('- Form submission works because it\'s browser-native');
        
        console.log('\nImplementation approach:');
        console.log('1. Generate OnePay data server-side');
        console.log('2. Create HTML form with hidden inputs');
        console.log('3. Auto-submit form via JavaScript');
        console.log('4. Handle success/failure via callback URLs');

        console.log(`\nTest URLs for manual verification:`);
        console.log(`Payment page: ${baseUrl}/payment/onepay/${reference}`);

    } catch (error) {
        console.error('405 analysis failed:', error.message);
    }
}

analyzeOnePay405Error();