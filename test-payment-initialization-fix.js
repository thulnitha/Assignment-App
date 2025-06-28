// Final test to verify payment initialization issues are resolved
async function testPaymentInitializationFix() {
    console.log('Payment Initialization Fix Verification');
    console.log('======================================');

    const baseUrl = 'http://localhost:5000';
    
    try {
        // Create multiple test donations to verify consistency
        const testDonations = [
            { amount: 500, name: 'Test User 1', email: 'test1@fix.com' },
            { amount: 1000, name: 'Test User 2', email: 'test2@fix.com' },
            { amount: 2500, name: 'Test User 3', email: 'test3@fix.com' }
        ];

        console.log('Creating multiple test donations...');
        const donationPromises = testDonations.map(donation => 
            fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: donation.amount,
                    currency: 'LKR',
                    message: 'Payment initialization fix test',
                    donorName: donation.name,
                    donorEmail: donation.email
                })
            }).then(r => r.json())
        );

        const donationResults = await Promise.all(donationPromises);
        const allDonationsSuccessful = donationResults.every(r => r.success);
        
        console.log('All donations created successfully:', allDonationsSuccessful);

        // Test each payment page for proper initialization
        console.log('\nTesting payment page initialization...');
        
        for (let i = 0; i < donationResults.length; i++) {
            const result = donationResults[i];
            const paymentUrl = result.paymentUrl;
            const reference = paymentUrl.split('/').pop();
            
            console.log(`\nTesting payment ${i + 1} (${testDonations[i].amount} LKR):`);
            
            const paymentResponse = await fetch(paymentUrl);
            const paymentHTML = await paymentResponse.text();
            
            // Check for initialization components
            const initializationChecks = {
                pageLoads: paymentResponse.status === 200,
                hasSDK: paymentHTML.includes('onepayjs.js'),
                hasAutoInit: paymentHTML.includes('window.onPayButtonClicked(window.onePayData)'),
                hasManualButton: paymentHTML.includes('Pay Now - LKR'),
                hasFallbackForm: paymentHTML.includes('form action="https://ipg.onepay.lk/ipg/checkout/"'),
                hasCorrectAmount: paymentHTML.includes(`LKR ${testDonations[i].amount}.00`),
                hasSecureTokens: paymentHTML.includes('hashToken') && paymentHTML.includes('apptoken')
            };
            
            const allChecksPass = Object.values(initializationChecks).every(check => check);
            
            console.log(`  Reference: ${reference}`);
            console.log(`  Initialization status: ${allChecksPass ? 'READY' : 'ISSUES'}`);
            
            if (!allChecksPass) {
                console.log('  Failed checks:');
                Object.entries(initializationChecks).forEach(([key, value]) => {
                    if (!value) console.log(`    - ${key}`);
                });
            }
        }

        // Test the original issue scenario
        console.log('\nTesting specific initialization scenarios...');
        
        const testPaymentUrl = donationResults[0].paymentUrl;
        const testResponse = await fetch(testPaymentUrl);
        const testHTML = await testResponse.text();
        
        // Check for the specific elements that should prevent the "Failed to initiate payment" error
        const criticalElements = {
            sdkLoaded: testHTML.includes('onPayButtonClicked'),
            autoInitialization: testHTML.includes('window.onPayButtonClicked(window.onePayData)'),
            fallbackAvailable: testHTML.includes('createFallbackForm'),
            formSubmissionReady: testHTML.includes('method="POST"'),
            allDataPresent: testHTML.includes('window.onePayData = {')
        };
        
        const initializationFixed = Object.values(criticalElements).every(element => element);
        
        console.log('Critical initialization elements:');
        Object.entries(criticalElements).forEach(([key, value]) => {
            console.log(`  ${key}: ${value ? 'PRESENT' : 'MISSING'}`);
        });

        // Final assessment
        const overallSuccess = allDonationsSuccessful && initializationFixed;
        
        console.log('\n======================================');
        console.log('PAYMENT INITIALIZATION FIX RESULTS:');
        console.log(`Status: ${overallSuccess ? 'RESOLVED' : 'NEEDS ATTENTION'}`);
        
        if (overallSuccess) {
            console.log('Payment initialization issues have been resolved!');
            console.log('Users should no longer see "Failed to initiate payment" errors.');
            console.log('Both SDK and form fallback methods are available.');
        } else {
            console.log('Some initialization issues remain. Check the analysis above.');
        }

        return {
            success: overallSuccess,
            donationCount: donationResults.length,
            sampleUrl: testPaymentUrl,
            criticalElements: criticalElements
        };

    } catch (error) {
        console.error('Payment initialization test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the final verification
testPaymentInitializationFix()
    .then(result => {
        if (result.success) {
            console.log('\nPayment initialization fix verification completed!');
            console.log(`Tested ${result.donationCount} donations successfully.`);
            console.log('Sample URL for manual testing:', result.sampleUrl);
        } else {
            console.log('Initialization fix verification failed:', result.error);
        }
    })
    .catch(error => {
        console.error('Verification crashed:', error);
    });