// Direct OnePay debugging script
import crypto from 'crypto';

async function debugOnePayIssue() {
    console.log('OnePay Payment Issue Debug Analysis');
    console.log('===================================');

    const baseUrl = 'http://localhost:5000';
    
    try {
        // Step 1: Create a test donation
        console.log('\n1. Creating test donation...');
        const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 1500,
                currency: 'LKR',
                message: 'OnePay debug test',
                donorName: 'Debug User',
                donorEmail: 'debug@test.com'
            })
        });

        const donationResult = await donationResponse.json();
        
        if (!donationResult.success) {
            console.log('❌ Donation creation failed:', donationResult.message);
            return;
        }

        const paymentUrl = donationResult.paymentUrl;
        const reference = paymentUrl.split('/').pop();
        
        console.log('✅ Donation created successfully');
        console.log('Payment URL:', paymentUrl);
        console.log('Reference:', reference);

        // Step 2: Analyze the payment page
        console.log('\n2. Analyzing payment page...');
        const pageResponse = await fetch(paymentUrl);
        const pageHTML = await pageResponse.text();

        const pageAnalysis = {
            statusCode: pageResponse.status,
            hasSDKScript: pageHTML.includes('onepayjs.js'),
            hasOnePayData: pageHTML.includes('window.onePayData'),
            hasAutoInit: pageHTML.includes('window.onPayButtonClicked(window.onePayData)'),
            hasFormFallback: pageHTML.includes('createFallbackForm'),
            hasErrorHandling: pageHTML.includes('OnePay SDK not loaded'),
            pageSize: pageHTML.length
        };

        console.log('Page Analysis:');
        Object.entries(pageAnalysis).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });

        // Step 3: Extract OnePay data
        console.log('\n3. Extracting OnePay configuration...');
        const onePayDataMatch = pageHTML.match(/window\.onePayData = ({.*?});/s);
        
        if (onePayDataMatch) {
            const onePayData = JSON.parse(onePayDataMatch[1]);
            console.log('OnePay Data Structure:');
            console.log('  App ID:', onePayData.appid);
            console.log('  Amount:', onePayData.amount);
            console.log('  Reference:', onePayData.orderReference);
            console.log('  Hash Token Length:', onePayData.hashToken?.length);
            console.log('  Has App Token:', !!onePayData.apptoken);
            console.log('  Customer Email:', onePayData.customerEmail);
            console.log('  Redirect URL:', onePayData.transactionRedirectUrl);
        } else {
            console.log('❌ Could not extract OnePay data from page');
            return;
        }

        // Step 4: Test OnePay SDK accessibility
        console.log('\n4. Testing OnePay SDK accessibility...');
        try {
            const sdkResponse = await fetch('https://storage.googleapis.com/onepayjs/onepayjs.js');
            const sdkContent = await sdkResponse.text();
            
            console.log('SDK Test Results:');
            console.log('  Status:', sdkResponse.status);
            console.log('  Content Length:', sdkContent.length);
            console.log('  Has onPayButtonClicked:', sdkContent.includes('onPayButtonClicked'));
            console.log('  Has event listeners:', sdkContent.includes('addEventListener'));
            
            // Look for specific function signatures
            const functionSignatures = [
                'onPayButtonClicked',
                'window.onPayButtonClicked',
                'function onPayButtonClicked',
                'onPayButtonClicked=function',
                'onPayButtonClicked:function'
            ];
            
            console.log('  Function signatures found:');
            functionSignatures.forEach(sig => {
                if (sdkContent.includes(sig)) {
                    console.log(`    ✅ ${sig}`);
                }
            });
            
        } catch (error) {
            console.log('❌ SDK accessibility test failed:', error.message);
        }

        // Step 5: Test direct form submission
        console.log('\n5. Testing direct form submission to OnePay...');
        
        const appId = '26DT119089BDB84D5FF8C';
        const appSecret = 'u74Vb4h3HJkjhgjhg456789VBNMJHGFDS56789MNBVCXZ123456QWERTYUIOPASDFGHJKLZXCVBNM';
        const amount = 1500;
        const testRef = `DEBUG_${Date.now()}`;
        
        // Generate proper hash
        const hashString = `${appId}${amount}${testRef}${appSecret}`;
        const hashToken = crypto.createHash('sha256').update(hashString).digest('hex').toUpperCase();
        
        const formData = new URLSearchParams({
            appid: appId,
            amount: amount.toString(),
            orderReference: testRef,
            customerFirstName: 'Debug',
            customerLastName: 'User',
            customerEmail: 'debug@test.com',
            customerPhoneNumber: '+94771234567',
            transactionRedirectUrl: `${baseUrl}/donation-success`,
            additionalData: 'debug_test',
            hashToken: hashToken,
            apptoken: `${hashToken.substring(0, 32)}.${appId}`
        });

        try {
            const directResponse = await fetch('https://ipg.onepay.lk/ipg/checkout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'MathsWithThula-Debug/1.0'
                },
                body: formData,
                redirect: 'manual' // Don't follow redirects
            });

            console.log('Direct submission results:');
            console.log('  Status:', directResponse.status);
            console.log('  Status Text:', directResponse.statusText);
            
            if (directResponse.status === 302 || directResponse.status === 301) {
                console.log('  ✅ Redirect received (likely successful)');
                console.log('  Location:', directResponse.headers.get('location'));
            } else if (directResponse.status === 405) {
                console.log('  ❌ Method Not Allowed - OnePay blocking direct POST');
            } else if (directResponse.status === 403) {
                console.log('  ❌ Forbidden - Authentication issue');
            } else {
                const responseText = await directResponse.text();
                console.log('  Response snippet:', responseText.substring(0, 200));
            }
            
        } catch (error) {
            console.log('❌ Direct submission failed:', error.message);
        }

        // Step 6: Analysis and recommendations
        console.log('\n6. Analysis and Recommendations');
        console.log('===============================');
        
        const issues = [];
        const solutions = [];
        
        if (!pageAnalysis.hasSDKScript) {
            issues.push('OnePay SDK script not loaded');
            solutions.push('Verify SDK URL and network connectivity');
        }
        
        if (!pageAnalysis.hasOnePayData) {
            issues.push('OnePay data not properly embedded');
            solutions.push('Check server-side data generation');
        }
        
        if (!pageAnalysis.hasAutoInit) {
            issues.push('Automatic SDK initialization missing');
            solutions.push('Implement proper SDK initialization sequence');
        }
        
        if (issues.length === 0) {
            console.log('✅ No obvious configuration issues found');
            console.log('');
            console.log('Possible causes of "Failed to initiate payment":');
            console.log('1. Browser-specific JavaScript execution issues');
            console.log('2. OnePay SDK version compatibility problems');
            console.log('3. Timing issues with SDK loading vs initialization');
            console.log('4. Domain/CORS restrictions from OnePay');
            console.log('5. Parameter validation issues on OnePay side');
            
            console.log('\nRecommended solutions:');
            console.log('1. Add more detailed error logging in browser');
            console.log('2. Implement retry mechanism with delays');
            console.log('3. Use form fallback as primary method');
            console.log('4. Contact OnePay support for SDK guidance');
        } else {
            console.log('Issues found:');
            issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
            console.log('\nRecommended solutions:');
            solutions.forEach((solution, i) => console.log(`  ${i + 1}. ${solution}`));
        }

        console.log('\n' + '='.repeat(50));
        console.log('Debug analysis completed successfully');
        console.log('Payment URL for manual testing:', paymentUrl);

    } catch (error) {
        console.error('Debug analysis failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the debug analysis
debugOnePayIssue();