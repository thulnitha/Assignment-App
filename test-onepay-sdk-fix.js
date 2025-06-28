// Test OnePay SDK initialization fix
async function testOnepaySDKFix() {
    console.log('Testing OnePay SDK Initialization Fix');
    console.log('='.repeat(45));

    const baseUrl = 'http://localhost:5000';
    
    try {
        // Create a test donation
        console.log('Creating test donation...');
        const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 2000,
                currency: 'LKR',
                message: 'Testing OnePay SDK fix',
                donorName: 'SDK Fix Test',
                donorEmail: 'sdkfix@example.com'
            })
        });

        const donationResult = await donationResponse.json();
        console.log('Donation created:', donationResult.success);

        if (!donationResult.success) {
            throw new Error('Failed to create donation');
        }

        // Test the payment page
        const paymentUrl = donationResult.paymentUrl;
        const reference = paymentUrl.split('/').pop();
        
        console.log('Testing payment page with reference:', reference);
        const paymentResponse = await fetch(paymentUrl);
        const paymentHTML = await paymentResponse.text();

        // Check for improved SDK initialization
        const hasImprovedSDK = paymentHTML.includes('window.onPayButtonClicked');
        const hasProperEventListener = paymentHTML.includes("window.addEventListener('load'");
        const hasErrorHandling = paymentHTML.includes('OnePay SDK not loaded');
        const hasDynamicButton = paymentHTML.includes('initiateOnePay()');
        const hasCorrectAmount = paymentHTML.includes('LKR 2000.00');

        console.log('SDK Initialization Checks:');
        console.log('- Improved SDK check:', hasImprovedSDK ? 'PASS' : 'FAIL');
        console.log('- Proper event listener:', hasProperEventListener ? 'PASS' : 'FAIL');
        console.log('- Error handling:', hasErrorHandling ? 'PASS' : 'FAIL');
        console.log('- Dynamic button creation:', hasDynamicButton ? 'PASS' : 'FAIL');
        console.log('- Correct amount display:', hasCorrectAmount ? 'PASS' : 'FAIL');

        // Check OnePay data structure
        const onePayDataMatch = paymentHTML.match(/window\.onePayData = ({.*?});/s);
        let onePayDataValid = false;
        
        if (onePayDataMatch) {
            const onePayData = JSON.parse(onePayDataMatch[1]);
            onePayDataValid = !!(
                onePayData.appid &&
                onePayData.amount === 2000 &&
                onePayData.orderReference &&
                onePayData.hashToken &&
                onePayData.apptoken
            );
            
            console.log('OnePay Data Structure:');
            console.log('- App ID:', onePayData.appid);
            console.log('- Amount:', onePayData.amount);
            console.log('- Reference:', onePayData.orderReference);
            console.log('- Hash Token Length:', onePayData.hashToken?.length);
            console.log('- App Token Present:', !!onePayData.apptoken);
        }

        const allTestsPassed = hasImprovedSDK && hasProperEventListener && 
                              hasErrorHandling && hasDynamicButton && 
                              hasCorrectAmount && onePayDataValid;

        console.log('\n' + '='.repeat(45));
        console.log('OnePay SDK Fix Results:');
        console.log('Status:', allTestsPassed ? 'SUCCESS' : 'NEEDS ATTENTION');
        
        if (allTestsPassed) {
            console.log('The OnePay SDK initialization has been successfully fixed!');
            console.log('Payment buttons should now initialize properly.');
        }

        return {
            success: allTestsPassed,
            paymentUrl: paymentUrl,
            reference: reference,
            checks: {
                improvedSDK: hasImprovedSDK,
                eventListener: hasProperEventListener,
                errorHandling: hasErrorHandling,
                dynamicButton: hasDynamicButton,
                correctAmount: hasCorrectAmount,
                onePayData: onePayDataValid
            }
        };

    } catch (error) {
        console.error('SDK fix test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run the test
testOnepaySDKFix()
    .then(result => {
        if (result.success) {
            console.log('\nSDK fix verification completed successfully!');
            console.log('Test payment URL:', result.paymentUrl);
        } else {
            console.log('SDK fix test failed:', result.error);
        }
    })
    .catch(error => {
        console.error('Test crashed:', error);
    });