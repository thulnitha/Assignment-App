// Production readiness verification for OnePay integration
async function verifyProductionReadiness() {
    console.log('Production Readiness Verification');
    console.log('='.repeat(40));

    const baseUrl = 'http://localhost:5000';
    const tests = [];
    
    try {
        // Critical System Tests
        console.log('\n🔧 CRITICAL SYSTEM TESTS');
        
        // Test 1: Donation Creation Reliability
        console.log('Testing donation creation reliability...');
        const donationTests = await Promise.all([
            createTestDonation(baseUrl, 500, 'reliability-test-1@example.com'),
            createTestDonation(baseUrl, 1000, 'reliability-test-2@example.com'),
            createTestDonation(baseUrl, 2500, 'reliability-test-3@example.com')
        ]);
        
        const allDonationsSuccessful = donationTests.every(t => t.success);
        tests.push({ name: 'Donation Creation Reliability', status: allDonationsSuccessful });
        console.log(allDonationsSuccessful ? '✓ PASS' : '✗ FAIL');

        // Test 2: Payment Page Accessibility
        console.log('Testing payment page accessibility...');
        const sampleReference = donationTests[0].reference;
        const paymentPageResponse = await fetch(`${baseUrl}/onepay/direct/${sampleReference}`);
        const paymentPageAccessible = paymentPageResponse.status === 200;
        tests.push({ name: 'Payment Page Accessibility', status: paymentPageAccessible });
        console.log(paymentPageAccessible ? '✓ PASS' : '✗ FAIL');

        // Test 3: OnePay Data Integrity
        console.log('Verifying OnePay data integrity...');
        const paymentHTML = await paymentPageResponse.text();
        const onePayDataMatch = paymentHTML.match(/window\.onePayData = ({.*?});/s);
        
        let onePayIntegrityValid = false;
        if (onePayDataMatch) {
            const onePayData = JSON.parse(onePayDataMatch[1]);
            onePayIntegrityValid = !!(onePayData.appid && onePayData.amount && 
                                    onePayData.hashToken && onePayData.apptoken);
        }
        tests.push({ name: 'OnePay Data Integrity', status: onePayIntegrityValid });
        console.log(onePayIntegrityValid ? '✓ PASS' : '✗ FAIL');

        // Test 4: Error Handling
        console.log('Testing error handling...');
        const invalidRefResponse = await fetch(`${baseUrl}/onepay/direct/INVALID_REF`);
        const errorHandlingWorks = invalidRefResponse.status === 404;
        tests.push({ name: 'Error Handling', status: errorHandlingWorks });
        console.log(errorHandlingWorks ? '✓ PASS' : '✗ FAIL');

        // Test 5: Success Flow
        console.log('Testing success flow...');
        const successResponse = await fetch(`${baseUrl}/donation-success?status=success&transaction_id=prod_test`);
        const successFlowWorks = successResponse.status === 200;
        tests.push({ name: 'Success Flow', status: successFlowWorks });
        console.log(successFlowWorks ? '✓ PASS' : '✗ FAIL');

        // Security Tests
        console.log('\n🔒 SECURITY TESTS');
        
        // Test 6: Hash Token Security
        console.log('Verifying hash token generation...');
        if (onePayDataMatch) {
            const onePayData = JSON.parse(onePayDataMatch[1]);
            const hashIsSecure = onePayData.hashToken && onePayData.hashToken.length === 64;
            tests.push({ name: 'Hash Token Security', status: hashIsSecure });
            console.log(hashIsSecure ? '✓ PASS' : '✗ FAIL');
        }

        // Performance Tests
        console.log('\n⚡ PERFORMANCE TESTS');
        
        // Test 7: Concurrent Load
        console.log('Testing concurrent load handling...');
        const loadStart = Date.now();
        const concurrentTests = await Promise.all(
            Array.from({length: 5}, (_, i) => 
                createTestDonation(baseUrl, 1000 + (i * 100), `load-test-${i}@example.com`)
            )
        );
        const loadTime = Date.now() - loadStart;
        const concurrentLoadSuccess = concurrentTests.every(t => t.success) && loadTime < 2000;
        tests.push({ name: 'Concurrent Load Handling', status: concurrentLoadSuccess });
        console.log(concurrentLoadSuccess ? '✓ PASS' : '✗ FAIL');

        // Final Assessment
        const allTestsPassed = tests.every(test => test.status);
        
        console.log('\n' + '='.repeat(40));
        console.log('PRODUCTION READINESS SUMMARY:');
        tests.forEach(test => {
            console.log(`${test.status ? '✓' : '✗'} ${test.name}`);
        });
        
        console.log(`\nOverall Status: ${allTestsPassed ? 'PRODUCTION READY' : 'NEEDS ATTENTION'}`);
        console.log(`Tests Passed: ${tests.filter(t => t.status).length}/${tests.length}`);
        
        if (allTestsPassed) {
            console.log('\n🚀 System is ready for production deployment!');
            console.log('OnePay integration fully operational with:');
            console.log('- Reliable donation creation');
            console.log('- Secure payment processing');
            console.log('- Proper error handling');
            console.log('- Strong performance under load');
        }

        return {
            success: allTestsPassed,
            testsResults: tests,
            samplePaymentUrl: `${baseUrl}/onepay/direct/${sampleReference}`
        };

    } catch (error) {
        console.error('\nProduction verification failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function createTestDonation(baseUrl, amount, email) {
    try {
        const response = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount,
                currency: 'LKR',
                message: 'Production test donation',
                donorName: 'Test User',
                donorEmail: email
            })
        });
        
        const result = await response.json();
        return {
            success: result.success,
            reference: result.paymentUrl?.split('/').pop(),
            donationId: result.donation?.id
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Run production verification
verifyProductionReadiness()
    .then(result => {
        if (result.success) {
            console.log('\n✅ Production verification completed successfully!');
            console.log(`Sample URL: ${result.samplePaymentUrl}`);
        } else {
            console.log('\n❌ Production verification failed');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Verification crashed:', error);
        process.exit(1);
    });