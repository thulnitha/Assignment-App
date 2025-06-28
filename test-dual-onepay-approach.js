// Test the dual OnePay approach (SDK + Form fallback)
async function testDualOnepayApproach() {
    console.log('Testing Dual OnePay Approach');
    console.log('============================');

    const baseUrl = 'http://localhost:5000';
    
    try {
        // Create test donation
        console.log('Creating test donation...');
        const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 1750,
                currency: 'LKR',
                message: 'Testing dual OnePay approach',
                donorName: 'Dual Approach Test',
                donorEmail: 'dualtest@example.com'
            })
        });

        const donationResult = await donationResponse.json();
        console.log('Donation created successfully:', donationResult.success);

        // Test payment page
        const paymentUrl = donationResult.paymentUrl;
        const paymentResponse = await fetch(paymentUrl);
        const paymentHTML = await paymentResponse.text();

        console.log('\nAnalyzing payment page implementation...');

        // Check dual approach features
        const features = {
            hasSDKScript: paymentHTML.includes('onepayjs.js'),
            hasSDKInitialization: paymentHTML.includes('window.onPayButtonClicked'),
            hasFormFallback: paymentHTML.includes('createFallbackForm'),
            hasDirectFormSubmission: paymentHTML.includes('https://ipg.onepay.lk/ipg/checkout/'),
            hasProperErrorHandling: paymentHTML.includes('OnePay SDK not available'),
            hasCorrectAmount: paymentHTML.includes('1750'),
            hasAllRequiredFields: paymentHTML.includes('orderReference') && 
                                 paymentHTML.includes('hashToken') && 
                                 paymentHTML.includes('apptoken')
        };

        console.log('Dual approach features:');
        Object.entries(features).forEach(([key, value]) => {
            console.log(`  ${key}: ${value ? 'PRESENT' : 'MISSING'}`);
        });

        // Extract OnePay data for validation
        const onePayDataMatch = paymentHTML.match(/window\.onePayData = ({.*?});/s);
        let dataValid = false;
        
        if (onePayDataMatch) {
            const onePayData = JSON.parse(onePayDataMatch[1]);
            dataValid = !!(
                onePayData.appid === '26DT119089BDB84D5FF8C' &&
                onePayData.amount === 1750 &&
                onePayData.orderReference &&
                onePayData.hashToken &&
                onePayData.hashToken.length === 64 &&
                onePayData.apptoken
            );

            console.log('\nOnePay data validation:');
            console.log('  App ID:', onePayData.appid);
            console.log('  Amount:', onePayData.amount);
            console.log('  Reference:', onePayData.orderReference);
            console.log('  Hash token length:', onePayData.hashToken?.length);
            console.log('  Data valid:', dataValid);
        }

        // Check form fields for fallback
        const formFields = [
            'appid', 'amount', 'orderReference', 'customerFirstName', 
            'customerLastName', 'customerEmail', 'hashToken', 'apptoken'
        ];
        
        const allFieldsPresent = formFields.every(field => 
            paymentHTML.includes(`name="${field}"`)
        );

        console.log('\nForm fallback validation:');
        console.log('  All required fields present:', allFieldsPresent);
        console.log('  Form action URL correct:', paymentHTML.includes('https://ipg.onepay.lk/ipg/checkout/'));

        // Overall assessment
        const overallSuccess = Object.values(features).every(v => v) && 
                              dataValid && allFieldsPresent;

        console.log('\n============================');
        console.log('DUAL APPROACH TEST RESULTS:');
        console.log('Status:', overallSuccess ? 'SUCCESS' : 'NEEDS REVIEW');
        
        if (overallSuccess) {
            console.log('The dual OnePay approach is properly implemented.');
            console.log('Users will have both SDK and form fallback options.');
            console.log('This should resolve payment initialization issues.');
        } else {
            console.log('Some components need attention. Review the analysis above.');
        }

        return {
            success: overallSuccess,
            paymentUrl: paymentUrl,
            features: features,
            dataValid: dataValid,
            formValid: allFieldsPresent
        };

    } catch (error) {
        console.error('Dual approach test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the test
testDualOnepayApproach()
    .then(result => {
        if (result.success) {
            console.log('\nDual approach verification completed successfully!');
            console.log('Test URL:', result.paymentUrl);
        } else {
            console.log('Test failed:', result.error || 'Check analysis above');
        }
    })
    .catch(error => {
        console.error('Test crashed:', error);
    });