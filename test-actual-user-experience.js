import fetch from 'node-fetch';

async function testActualUserExperience() {
    console.log('Testing Actual User Payment Experience');
    console.log('====================================');

    const baseUrl = 'https://078809a0-7c28-481a-b436-4116774afcc9-00-2iz5xyaibz04i.spock.replit.dev';
    
    // Step 1: Create donation through frontend flow
    console.log('\n1. Creating donation through normal flow...');
    const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: 1000,
            currency: 'LKR',
            message: 'User experience test',
            donorName: 'Real User Test',
            donorEmail: 'realuser@test.com'
        })
    });

    const donationResult = await donationResponse.json();
    console.log('Donation created:', donationResult.success);
    
    if (!donationResult.success) {
        console.log('Creation failed:', donationResult.message);
        return;
    }

    const paymentUrl = donationResult.paymentUrl;
    console.log('Payment URL received:', paymentUrl);

    // Step 2: Access the payment page as a user would
    console.log('\n2. Accessing payment page as user...');
    const pageResponse = await fetch(paymentUrl.replace('localhost:5000', baseUrl.replace('https://', '')));
    
    if (!pageResponse.ok) {
        console.log('Payment page error:', pageResponse.status, pageResponse.statusText);
        return;
    }

    const pageContent = await pageResponse.text();
    
    // Check what payment methods are actually available
    console.log('\n3. Analyzing available payment methods...');
    const methods = {
        directForm: pageContent.includes('onepay-form') && pageContent.includes('https://ipg.onepay.lk/ipg/checkout/'),
        ultimateRoute: pageContent.includes('Ultimate OnePay Payment'),
        standardRoute: pageContent.includes('Complete Payment - LKR'),
        sdkMethod: pageContent.includes('onPayButtonClicked')
    };

    console.log('Available methods:');
    Object.entries(methods).forEach(([method, available]) => {
        console.log(`  ${method}: ${available ? 'YES' : 'NO'}`);
    });

    // Step 3: Extract and test actual OnePay form data
    console.log('\n4. Testing OnePay form submission...');
    
    // Extract form data from the page
    const formMatch = pageContent.match(/<form[^>]*action="https:\/\/ipg\.onepay\.lk\/ipg\/checkout\/"[^>]*>(.*?)<\/form>/s);
    
    if (formMatch) {
        const formContent = formMatch[1];
        const inputs = [...formContent.matchAll(/<input[^>]*name="([^"]*)"[^>]*value="([^"]*)"[^>]*>/g)];
        
        const formData = {};
        inputs.forEach(match => {
            formData[match[1]] = match[2];
        });

        console.log('OnePay form data extracted:');
        console.log('  App ID:', formData.appid ? 'Present' : 'Missing');
        console.log('  Amount:', formData.amount ? formData.amount : 'Missing');
        console.log('  Reference:', formData.orderReference ? 'Present' : 'Missing');
        console.log('  Hash Token:', formData.hashToken ? `${formData.hashToken.length} chars` : 'Missing');

        // Test actual submission to OnePay
        console.log('\n5. Testing direct OnePay submission...');
        
        try {
            const onePaySubmission = await fetch('https://ipg.onepay.lk/ipg/checkout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: new URLSearchParams(formData),
                redirect: 'manual'
            });

            console.log('OnePay response status:', onePaySubmission.status);
            console.log('OnePay response type:', onePaySubmission.statusText);
            
            if (onePaySubmission.status === 405) {
                console.log('ROOT CAUSE: OnePay still returning 405 for this submission');
                
                // Check what's different about our data
                console.log('\nDebugging form data:');
                Object.entries(formData).forEach(([key, value]) => {
                    console.log(`  ${key}: ${value}`);
                });
                
            } else if (onePaySubmission.status === 302) {
                console.log('SUCCESS: OnePay accepting submission');
                const location = onePaySubmission.headers.get('location');
                console.log('Redirect URL:', location);
            } else {
                console.log('Unexpected response from OnePay');
                const responseText = await onePaySubmission.text();
                console.log('Response:', responseText.substring(0, 200));
            }

        } catch (error) {
            console.log('OnePay submission error:', error.message);
        }

    } else {
        console.log('No OnePay form found in page');
    }

    // Step 4: Test all routes to see which one user is actually hitting
    console.log('\n6. Testing which route user actually gets...');
    
    const routes = [
        '/onepay/direct/',
        '/onepay/ultimate/', 
        '/payment/onepay/'
    ];

    const reference = paymentUrl.split('/').pop();
    
    for (const route of routes) {
        try {
            const routeTest = await fetch(`${baseUrl}${route}${reference}`);
            console.log(`${route}: ${routeTest.status} ${routeTest.ok ? '(Working)' : '(Failed)'}`);
        } catch (error) {
            console.log(`${route}: Error`);
        }
    }

    console.log('\n7. Current user experience summary:');
    console.log('URL being served:', paymentUrl);
    console.log('Page loads successfully:', pageResponse.ok);
    console.log('Contains payment form:', methods.directForm || methods.standardRoute);
    console.log('OnePay form submission test:', formMatch ? 'Attempted' : 'No form found');
}

testActualUserExperience();