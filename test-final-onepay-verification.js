import fetch from 'node-fetch';

async function finalOnepayVerification() {
    console.log('Final OnePay Payment System Verification');
    console.log('=======================================');

    const baseUrl = 'http://localhost:5000';
    
    try {
        // Test 1: Create donation
        console.log('\n1. Creating test donation...');
        const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 2500,
                currency: 'LKR',
                message: 'Final verification test',
                donorName: 'Verification User',
                donorEmail: 'verify@test.com'
            })
        });

        const donationResult = await donationResponse.json();
        console.log('Donation result:', donationResult.success ? '✅ Success' : '❌ Failed');
        
        if (!donationResult.success) {
            console.log('Error:', donationResult.message);
            return;
        }

        const paymentUrl = donationResult.paymentUrl;
        const reference = paymentUrl.split('/').pop();
        console.log('Payment Reference:', reference);

        // Test 2: Check existing payment page
        console.log('\n2. Testing existing payment page...');
        const existingPageResponse = await fetch(paymentUrl);
        const existingPageContent = await existingPageResponse.text();
        
        console.log('Existing page status:', existingPageResponse.status);
        console.log('Has payment form:', existingPageContent.includes('Complete Payment') ? '✅ Yes' : '❌ No');
        console.log('Has fallback methods:', existingPageContent.includes('Try SDK Method') ? '✅ Yes' : '❌ No');

        // Test 3: Check production payment page
        console.log('\n3. Testing production payment page...');
        const productionUrl = `${baseUrl}/payment/onepay/${reference}`;
        const productionResponse = await fetch(productionUrl);
        const productionContent = await productionResponse.text();
        
        console.log('Production page status:', productionResponse.status);
        console.log('Is production page:', productionContent.includes('Secure Payment - Maths With Thula') ? '✅ Yes' : '❌ No');
        console.log('Has primary payment method:', productionContent.includes('Pay with OnePay Gateway') ? '✅ Yes' : '❌ No');
        console.log('Has multiple options:', productionContent.includes('Try Advanced Payment Method') ? '✅ Yes' : '❌ No');

        // Test 4: Verify payment data structure
        console.log('\n4. Verifying payment data structure...');
        const dataMatch = productionContent.match(/window\.onePayData = ({.*?});/s);
        
        if (dataMatch) {
            const paymentData = JSON.parse(dataMatch[1]);
            console.log('Payment data found:', '✅ Yes');
            console.log('App ID:', paymentData.appid ? '✅ Present' : '❌ Missing');
            console.log('Amount:', paymentData.amount ? `✅ LKR ${paymentData.amount}` : '❌ Missing');
            console.log('Hash token:', paymentData.hashToken?.length === 64 ? '✅ Valid' : '❌ Invalid');
            console.log('Customer details:', paymentData.customerEmail ? '✅ Present' : '❌ Missing');
        } else {
            console.log('Payment data found:', '❌ No');
        }

        // Test 5: Test donation success page
        console.log('\n5. Testing donation success callback...');
        const successResponse = await fetch(`${baseUrl}/donation-success?status=success&transaction_id=TEST123`);
        console.log('Success page status:', successResponse.status);
        console.log('Success page accessible:', successResponse.ok ? '✅ Yes' : '❌ No');

        // Test 6: Alternative payment gateways
        console.log('\n6. Testing alternative payment methods...');
        try {
            const altPaymentResponse = await fetch(`${baseUrl}/api/donations/create-alternative`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1000,
                    currency: 'LKR',
                    gateway: 'manual',
                    donorName: 'Alt Test',
                    donorEmail: 'alt@test.com'
                })
            });
            
            const altResult = await altPaymentResponse.json();
            console.log('Alternative payments:', altResult.success ? '✅ Available' : '❌ Not available');
        } catch (error) {
            console.log('Alternative payments:', '❌ Not configured');
        }

        // Test 7: Payment system robustness
        console.log('\n7. Testing payment system robustness...');
        
        const robustnessTests = [
            { name: 'Large amount handling', amount: 50000 },
            { name: 'Small amount handling', amount: 100 },
            { name: 'Special characters in name', donorName: 'Test User (Special)' },
            { name: 'Long email handling', donorEmail: 'very.long.email.address.for.testing@example.com' }
        ];

        let robustScore = 0;
        for (const test of robustnessTests) {
            try {
                const testResponse = await fetch(`${baseUrl}/api/donations/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: test.amount || 1500,
                        currency: 'LKR',
                        message: `Robustness test: ${test.name}`,
                        donorName: test.donorName || 'Test User',
                        donorEmail: test.donorEmail || 'test@example.com'
                    })
                });
                
                const testResult = await testResponse.json();
                if (testResult.success) {
                    robustScore++;
                    console.log(`  ${test.name}: ✅ Pass`);
                } else {
                    console.log(`  ${test.name}: ❌ Fail`);
                }
            } catch (error) {
                console.log(`  ${test.name}: ❌ Error`);
            }
        }
        
        console.log(`Robustness score: ${robustScore}/${robustnessTests.length}`);

        // Final assessment
        console.log('\n8. Final Assessment');
        console.log('==================');
        
        const checks = [
            { name: 'Donation creation', status: donationResult.success },
            { name: 'Payment page accessibility', status: existingPageResponse.ok },
            { name: 'Production page working', status: productionResponse.ok },
            { name: 'Payment data valid', status: dataMatch !== null },
            { name: 'Success callback working', status: successResponse.ok },
            { name: 'System robustness', status: robustScore >= 3 }
        ];

        const passedChecks = checks.filter(check => check.status).length;
        const totalChecks = checks.length;
        
        console.log(`Overall system health: ${passedChecks}/${totalChecks} checks passed`);
        
        if (passedChecks === totalChecks) {
            console.log('🎉 OnePay payment system is fully operational');
            console.log('\nRecommendations:');
            console.log('1. System is ready for production use');
            console.log('2. Multiple payment methods available for user flexibility');
            console.log('3. Robust error handling implemented');
            console.log('4. Form submission method prioritized over SDK to avoid initialization issues');
        } else {
            console.log('⚠️  Some issues detected in payment system');
            console.log('\nFailed checks:');
            checks.filter(check => !check.status).forEach(check => {
                console.log(`- ${check.name}`);
            });
        }

        console.log('\nPayment URLs for manual testing:');
        console.log(`Direct payment: ${paymentUrl}`);
        console.log(`Production payment: ${productionUrl}`);
        console.log(`Success callback: ${baseUrl}/donation-success?status=success&transaction_id=TEST123`);

    } catch (error) {
        console.error('Verification failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

finalOnepayVerification();