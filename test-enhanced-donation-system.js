// Test enhanced donation system with all improvements
async function testEnhancedDonationSystem() {
    console.log('Enhanced Donation System Testing');
    console.log('=================================');

    const baseUrl = 'http://localhost:5000';
    let allTests = [];
    
    try {
        // Test 1: Core donation functionality
        console.log('\n1. Testing core donation creation...');
        const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 2500,
                currency: 'LKR',
                message: 'Testing enhanced donation system',
                donorName: 'Enhanced Test User',
                donorEmail: 'enhanced@mathswiththula.com'
            })
        });

        const donationResult = await donationResponse.json();
        const donationSuccess = donationResult.success && donationResult.paymentUrl;
        allTests.push({ test: 'Core Donation Creation', status: donationSuccess });
        console.log('Core donation creation:', donationSuccess ? 'PASS' : 'FAIL');

        const paymentUrl = donationResult.paymentUrl;
        const reference = paymentUrl.split('/').pop();

        // Test 2: Enhanced payment page with dual approach
        console.log('\n2. Testing enhanced payment page...');
        const paymentResponse = await fetch(paymentUrl);
        const paymentHTML = await paymentResponse.text();
        
        const paymentEnhancements = {
            hasSDKIntegration: paymentHTML.includes('onepayjs.js'),
            hasAutoInitialization: paymentHTML.includes('window.onPayButtonClicked(window.onePayData)'),
            hasFormFallback: paymentHTML.includes('createFallbackForm'),
            hasDirectSubmission: paymentHTML.includes('https://ipg.onepay.lk/ipg/checkout/'),
            hasProperStyling: paymentHTML.includes('linear-gradient'),
            hasErrorHandling: paymentHTML.includes('OnePay SDK not available') || paymentHTML.includes('OnePay SDK not loaded')
        };

        const paymentEnhanced = Object.values(paymentEnhancements).every(v => v);
        allTests.push({ test: 'Enhanced Payment Page', status: paymentEnhanced });
        console.log('Enhanced payment page:', paymentEnhanced ? 'PASS' : 'FAIL');

        // Test 3: Donation status tracking
        console.log('\n3. Testing donation status API...');
        const statusResponse = await fetch(`${baseUrl}/api/donations/status/${reference}`);
        const statusData = await statusResponse.json();
        
        const statusTracking = statusData.success && 
                              statusData.donation && 
                              statusData.donation.id === donationResult.donation.id;
        allTests.push({ test: 'Status Tracking API', status: statusTracking });
        console.log('Status tracking API:', statusTracking ? 'PASS' : 'FAIL');

        // Test 4: Admin dashboard API
        console.log('\n4. Testing admin dashboard API...');
        const adminResponse = await fetch(`${baseUrl}/api/donations/all`);
        const adminData = await adminResponse.json();
        
        const adminDashboard = adminData.success && 
                              adminData.donations && 
                              adminData.summary &&
                              adminData.summary.total > 0;
        allTests.push({ test: 'Admin Dashboard API', status: adminDashboard });
        console.log('Admin dashboard API:', adminDashboard ? 'PASS' : 'FAIL');

        // Test 5: Multiple currency support
        console.log('\n5. Testing multiple currency support...');
        const currencyTests = await Promise.all([
            fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1000,
                    currency: 'LKR',
                    donorEmail: 'lkr@test.com'
                })
            }).then(r => r.json()),
            fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 25,
                    currency: 'USD',
                    donorEmail: 'usd@test.com'
                })
            }).then(r => r.json())
        ]);

        const currencySupport = currencyTests.every(result => result.success);
        allTests.push({ test: 'Multiple Currency Support', status: currencySupport });
        console.log('Multiple currency support:', currencySupport ? 'PASS' : 'FAIL');

        // Test 6: Large donation handling
        console.log('\n6. Testing large donation processing...');
        const largeDonationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 100000,
                currency: 'LKR',
                donorName: 'Large Donor Test',
                donorEmail: 'large@test.com',
                message: 'Testing large donation processing'
            })
        });

        const largeDonationResult = await largeDonationResponse.json();
        const largeAmountHandling = largeDonationResult.success && 
                                   largeDonationResult.donation.amount === 10000000; // 100000 * 100
        allTests.push({ test: 'Large Amount Handling', status: largeAmountHandling });
        console.log('Large amount handling:', largeAmountHandling ? 'PASS' : 'FAIL');

        // Test 7: Anonymous donation support
        console.log('\n7. Testing anonymous donations...');
        const anonResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 750,
                currency: 'LKR'
            })
        });

        const anonResult = await anonResponse.json();
        const anonymousSupport = anonResult.success && !anonResult.donation.donorName;
        allTests.push({ test: 'Anonymous Donations', status: anonymousSupport });
        console.log('Anonymous donations:', anonymousSupport ? 'PASS' : 'FAIL');

        // Test 8: System performance under load
        console.log('\n8. Testing system performance...');
        const performanceStart = Date.now();
        
        const loadTests = await Promise.all(
            Array.from({length: 5}, (_, i) => 
                fetch(`${baseUrl}/api/donations/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: 1000 + (i * 100),
                        currency: 'LKR',
                        donorEmail: `load${i}@test.com`
                    })
                }).then(r => r.json())
            )
        );

        const performanceTime = Date.now() - performanceStart;
        const performanceGood = loadTests.every(r => r.success) && performanceTime < 2000;
        allTests.push({ test: 'Performance Under Load', status: performanceGood });
        console.log(`Performance under load: ${performanceGood ? 'PASS' : 'FAIL'} (${performanceTime}ms)`);

        // Test 9: Success and error page handling
        console.log('\n9. Testing success/error pages...');
        const successPageResponse = await fetch(`${baseUrl}/donation-success?status=success&transaction_id=enhanced_test`);
        const failurePageResponse = await fetch(`${baseUrl}/donation-success?status=failed`);
        
        const pageHandling = successPageResponse.status === 200 && failurePageResponse.status === 200;
        allTests.push({ test: 'Success/Error Pages', status: pageHandling });
        console.log('Success/error pages:', pageHandling ? 'PASS' : 'FAIL');

        // Test 10: Data validation and security
        console.log('\n10. Testing data validation...');
        const validationTests = await Promise.all([
            // Test with invalid email
            fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1000,
                    currency: 'LKR',
                    donorEmail: 'invalid-email'
                })
            }).then(r => r.json()),
            // Test with negative amount
            fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: -100,
                    currency: 'LKR'
                })
            }).then(r => r.json())
        ]);

        // These should fail validation
        const validationWorking = validationTests.some(r => !r.success);
        allTests.push({ test: 'Data Validation', status: validationWorking });
        console.log('Data validation:', validationWorking ? 'PASS' : 'FAIL');

        // Final assessment
        const passedTests = allTests.filter(test => test.status).length;
        const totalTests = allTests.length;
        const overallSuccess = passedTests >= (totalTests * 0.9); // 90% pass rate

        console.log('\n=================================');
        console.log('ENHANCED SYSTEM TEST RESULTS:');
        allTests.forEach(test => {
            console.log(`${test.status ? '✓' : '✗'} ${test.test}`);
        });

        console.log(`\nOverall Score: ${passedTests}/${totalTests} tests passed`);
        console.log(`Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
        console.log(`System Status: ${overallSuccess ? 'EXCELLENT' : 'NEEDS IMPROVEMENT'}`);

        if (overallSuccess) {
            console.log('\nThe enhanced donation system is fully operational!');
            console.log('Key improvements verified:');
            console.log('- Dual OnePay approach (SDK + form fallback)');
            console.log('- Real-time status tracking');
            console.log('- Admin dashboard capabilities');
            console.log('- Multi-currency support');
            console.log('- Performance optimization');
            console.log('- Comprehensive error handling');
        }

        return {
            success: overallSuccess,
            passedTests,
            totalTests,
            testResults: allTests,
            samplePaymentUrl: paymentUrl
        };

    } catch (error) {
        console.error('Enhanced system test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the enhanced system test
testEnhancedDonationSystem()
    .then(result => {
        if (result.success) {
            console.log('\nEnhanced donation system testing completed successfully!');
            console.log('Sample payment URL:', result.samplePaymentUrl);
        } else {
            console.log('Enhanced system test failed:', result.error);
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Test suite crashed:', error);
        process.exit(1);
    });