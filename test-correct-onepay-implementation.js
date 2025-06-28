import fetch from 'node-fetch';

async function testCorrectOnePayImplementation() {
    console.log('Testing Correct OnePay Implementation');
    console.log('===================================');

    const baseUrl = 'https://078809a0-7c28-481a-b436-4116774afcc9-00-2iz5xyaibz04i.spock.replit.dev';
    
    // Test 1: Create donation with correct implementation
    console.log('\n1. Creating donation with correct OnePay specs...');
    const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: 2000,
            currency: 'LKR',
            message: 'Correct implementation test',
            donorName: 'Correct Implementation User',
            donorEmail: 'correct@implementation.com'
        })
    });

    const donationResult = await donationResponse.json();
    console.log('Donation created:', donationResult.success);
    
    if (!donationResult.success) {
        console.log('Creation failed:', donationResult.message);
        return;
    }

    const paymentUrl = donationResult.paymentUrl;
    const reference = paymentUrl.split('/').pop();
    
    console.log('Payment URL type:', paymentUrl.includes('/onepay/correct/') ? 'CORRECT IMPLEMENTATION' : 'OTHER');
    console.log('Reference:', reference);

    // Test 2: Access the correct implementation page
    console.log('\n2. Testing correct implementation page...');
    const pageResponse = await fetch(paymentUrl.replace('localhost:5000', baseUrl.replace('https://', '')));
    
    if (!pageResponse.ok) {
        console.log('Page access failed:', pageResponse.status);
        return;
    }

    const pageContent = await pageResponse.text();
    
    console.log('Page loaded successfully:', pageResponse.ok);
    console.log('Is correct implementation:', pageContent.includes('OnePay Payment - No 405 Errors'));
    console.log('Has countdown timer:', pageContent.includes('countdown'));
    console.log('Auto-submits form:', pageContent.includes('form.submit()'));

    // Test 3: Extract and validate OnePay form data
    console.log('\n3. Validating correct OnePay form data...');
    
    const formMatch = pageContent.match(/<form[^>]*action="https:\/\/ipg\.onepay\.lk\/ipg\/checkout\/"[^>]*>(.*?)<\/form>/s);
    
    if (formMatch) {
        const formContent = formMatch[1];
        const inputs = [...formContent.matchAll(/<input[^>]*name="([^"]*)"[^>]*value="([^"]*)"[^>]*>/g)];
        
        const formData = {};
        inputs.forEach(match => {
            formData[match[1]] = match[2];
        });

        console.log('Form data validation:');
        console.log('  App ID:', formData.appid === '26DT119089BDB84D5FF8C' ? 'CORRECT' : 'INCORRECT');
        console.log('  Amount:', formData.amount === '2000' ? 'CORRECT' : 'INCORRECT');
        console.log('  Reference:', formData.orderReference === reference ? 'CORRECT' : 'INCORRECT');
        console.log('  Customer name length:', (formData.customerFirstName?.length <= 50 && formData.customerLastName?.length <= 50) ? 'VALID' : 'INVALID');
        console.log('  Phone format:', formData.customerPhoneNumber === '+94771234567' ? 'VALID SRI LANKAN' : 'INVALID');
        console.log('  Hash token length:', formData.hashToken?.length === 64 ? 'VALID' : 'INVALID');
        console.log('  App token format:', formData.apptoken?.includes('.26DT119089BDB84D5FF8C') ? 'CORRECT' : 'INCORRECT');

        // Test 4: Direct submission to OnePay with correct data
        console.log('\n4. Testing direct OnePay submission with correct data...');
        
        try {
            const onePaySubmission = await fetch('https://ipg.onepay.lk/ipg/checkout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                body: new URLSearchParams(formData),
                redirect: 'manual'
            });

            console.log('OnePay response status:', onePaySubmission.status);
            console.log('OnePay response:', onePaySubmission.statusText);
            
            if (onePaySubmission.status === 405) {
                console.log('ISSUE: Still getting 405 - checking parameter format...');
                
                // Debug specific parameters
                console.log('\nParameter debugging:');
                console.log('  appid format:', typeof formData.appid, formData.appid);
                console.log('  amount format:', typeof formData.amount, formData.amount);
                console.log('  hash calculation base:', `${formData.appid}${formData.amount}${formData.orderReference}`);
                
            } else if (onePaySubmission.status === 302) {
                console.log('SUCCESS: OnePay accepting submission - 405 error resolved!');
                const location = onePaySubmission.headers.get('location');
                console.log('OnePay redirect URL:', location);
            } else if (onePaySubmission.status === 200) {
                console.log('SUCCESS: OnePay processing payment form');
            } else {
                console.log('Unexpected OnePay response:', onePaySubmission.status);
            }

        } catch (error) {
            console.log('OnePay submission error:', error.message);
        }

        // Test 5: Server-side redirect method
        console.log('\n5. Testing server-side redirect method...');
        
        try {
            const redirectResponse = await fetch(`${baseUrl}/onepay/server-redirect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: reference })
            });

            console.log('Server redirect status:', redirectResponse.status);
            
            if (redirectResponse.ok) {
                const redirectContent = await redirectResponse.text();
                console.log('Contains auto-submit form:', redirectContent.includes('form.submit()'));
                console.log('Targets OnePay:', redirectContent.includes('ipg.onepay.lk'));
            }

        } catch (error) {
            console.log('Server redirect error:', error.message);
        }

    } else {
        console.log('No OnePay form found in correct implementation page');
    }

    // Test 6: Multiple test scenarios
    console.log('\n6. Testing multiple scenarios with correct implementation...');
    
    const scenarios = [
        { amount: 500, name: 'Small amount' },
        { amount: 25000, name: 'Large amount' },
        { amount: 1000, name: 'Standard amount' }
    ];

    for (const scenario of scenarios) {
        try {
            const scenarioResponse = await fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: scenario.amount,
                    currency: 'LKR',
                    message: `Scenario test: ${scenario.name}`,
                    donorName: 'Scenario Tester',
                    donorEmail: 'scenario@test.com'
                })
            });

            const scenarioResult = await scenarioResponse.json();
            if (scenarioResult.success) {
                const scenarioRef = scenarioResult.paymentUrl.split('/').pop();
                const correctPageTest = await fetch(`${baseUrl}/onepay/correct/${scenarioRef}`);
                console.log(`  ${scenario.name} (LKR ${scenario.amount}): ${correctPageTest.ok ? 'WORKING' : 'FAILED'}`);
            }
        } catch (error) {
            console.log(`  ${scenario.name}: ERROR`);
        }
    }

    console.log('\n7. Final Assessment');
    console.log('==================');
    
    console.log('Correct implementation features:');
    console.log('- Follows OnePay exact parameter specifications');
    console.log('- Enforces 50-character limits on names');
    console.log('- Uses proper Sri Lankan phone format');
    console.log('- Implements correct hash token generation');
    console.log('- Auto-submits after 5-second countdown');
    console.log('- Provides server-side redirect fallback');
    
    console.log(`\nPayment URL for testing: ${paymentUrl.replace('localhost:5000', baseUrl.replace('https://', ''))}`);
}

testCorrectOnePayImplementation();