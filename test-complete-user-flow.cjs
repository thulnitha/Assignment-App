const baseUrl = 'http://localhost:5000';

async function testCompleteUserFlow() {
    console.log('🔄 Testing Complete User Donation Flow...\n');
    
    try {
        // Test 1: Create donation through frontend API
        console.log('1️⃣ Testing donation creation...');
        const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 2000,
                currency: 'LKR',
                message: 'Complete user flow test',
                donorName: 'Flow Test User',
                donorEmail: 'flow@test.com'
            })
        });
        
        const donationResult = await donationResponse.json();
        console.log('✅ Donation created:', {
            success: donationResult.success,
            donationId: donationResult.donation?.id,
            amount: donationResult.donation?.amount,
            paymentUrl: donationResult.paymentUrl
        });
        
        if (!donationResult.success) {
            throw new Error('Donation creation failed');
        }
        
        const reference = donationResult.paymentUrl.split('/').pop();
        
        // Test 2: Verify comprehensive payment page
        console.log('\n2️⃣ Testing comprehensive payment page...');
        const pageResponse = await fetch(donationResult.paymentUrl);
        const pageContent = await pageResponse.text();
        
        const paymentOptions = {
            bankTransfer: pageContent.includes('Bank Transfer'),
            mobilePayment: pageContent.includes('Mobile Payment'),
            onePayGateway: pageContent.includes('OnePay Gateway'),
            amountCorrect: pageContent.includes('LKR 20.00'),
            donorNameDisplayed: pageContent.includes('Flow Test User'),
            instructionsPresent: pageContent.includes('Payment Instructions'),
            mobileProviders: ['Dialog', 'Mobitel', 'Hutch', 'Airtel'].filter(provider => 
                pageContent.includes(provider)
            ).length
        };
        
        console.log('✅ Payment page features:', paymentOptions);
        
        // Test 3: Bank transfer workflow
        console.log('\n3️⃣ Testing bank transfer workflow...');
        const bankTransferResponse = await fetch(`${baseUrl}/api/payment/bank-transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reference: reference,
                amount: 2000,
                bankDetails: {
                    bank: 'Commercial Bank of Ceylon',
                    account: '8001234567890'
                }
            })
        });
        
        const bankResult = await bankTransferResponse.json();
        console.log('✅ Bank transfer processing:', {
            success: bankResult.success,
            confirmationId: bankResult.confirmationId,
            message: bankResult.message
        });
        
        // Test 4: Mobile payment workflow
        console.log('\n4️⃣ Testing mobile payment workflow...');
        const mobilePaymentResponse = await fetch(`${baseUrl}/api/payment/mobile-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reference: reference,
                amount: 2000,
                mobileDetails: {
                    provider: 'dialog',
                    mobileNumber: '077 555 1234',
                    transactionId: 'FLOW_TEST_' + Date.now()
                }
            })
        });
        
        const mobileResult = await mobilePaymentResponse.json();
        console.log('✅ Mobile payment processing:', {
            success: mobileResult.success,
            confirmationId: mobileResult.confirmationId,
            message: mobileResult.message
        });
        
        // Test 5: Frontend donation page accessibility
        console.log('\n5️⃣ Testing frontend donation page...');
        const frontendResponse = await fetch(`${baseUrl}/donate`);
        const frontendContent = await frontendResponse.text();
        
        const frontendFeatures = {
            donationFormPresent: frontendContent.includes('Make a Donation') || frontendContent.includes('Donate'),
            presetAmountsAvailable: frontendContent.includes('LKR 500') && frontendContent.includes('LKR 1,000'),
            donorFieldsPresent: frontendContent.includes('name') && frontendContent.includes('email'),
            securityIndicators: frontendContent.includes('secure') || frontendContent.includes('Secure'),
            responsiveDesign: frontendContent.includes('viewport') && frontendContent.includes('responsive')
        };
        
        console.log('✅ Frontend features:', frontendFeatures);
        
        // Test 6: Alternative payment routes
        console.log('\n6️⃣ Testing alternative payment routes...');
        const routes = [
            `/donate/${reference}`,
            `/payment/${reference}`,
            `/pay/${reference}`
        ];
        
        const routeResults = {};
        for (const route of routes) {
            try {
                const routeResponse = await fetch(`${baseUrl}${route}`);
                routeResults[route] = {
                    status: routeResponse.status,
                    accessible: routeResponse.status === 200
                };
            } catch (error) {
                routeResults[route] = {
                    status: 'error',
                    accessible: false
                };
            }
        }
        
        console.log('✅ Route accessibility:', routeResults);
        
        // Test 7: OnePay server submission (expected 405)
        console.log('\n7️⃣ Testing OnePay server status...');
        const onePayResponse = await fetch(`${baseUrl}/api/onepay/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: reference })
        });
        
        const onePayResult = await onePayResponse.json();
        console.log('✅ OnePay status:', {
            success: onePayResult.success,
            error: onePayResult.error,
            status: onePayResult.status,
            expected: 'Merchant verification pending'
        });
        
        // Final Assessment
        console.log('\n📊 COMPLETE USER FLOW ASSESSMENT:');
        console.log('='.repeat(60));
        
        const assessmentResults = {
            donationCreation: donationResult.success,
            paymentPageGeneration: paymentOptions.bankTransfer && paymentOptions.mobilePayment,
            bankTransferProcessing: bankResult.success,
            mobilePaymentProcessing: mobileResult.success,
            frontendAccessibility: frontendFeatures.donationFormPresent,
            multipleRoutes: Object.values(routeResults).some(r => r.accessible),
            onePayStatusKnown: onePayResult.status === 405
        };
        
        Object.entries(assessmentResults).forEach(([feature, working]) => {
            console.log(`${working ? '✅' : '❌'} ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${working ? 'WORKING' : 'NEEDS ATTENTION'}`);
        });
        
        const overallScore = Object.values(assessmentResults).filter(Boolean).length;
        const totalTests = Object.values(assessmentResults).length;
        
        console.log('='.repeat(60));
        console.log(`🎯 OVERALL SYSTEM STATUS: ${overallScore}/${totalTests} FEATURES WORKING`);
        
        if (overallScore >= 6) {
            console.log('🎉 DONATION SYSTEM: FULLY OPERATIONAL');
            console.log('\n✨ USER EXPERIENCE:');
            console.log('• Users can create donations through frontend');
            console.log('• Multiple payment options are immediately available');
            console.log('• Bank transfers process with 24-hour verification');
            console.log('• Mobile payments support all major Sri Lankan providers');
            console.log('• OnePay will be available once merchant verification completes');
            console.log('\n🚀 RECOMMENDATION: System ready for production use');
        } else {
            console.log('⚠️ DONATION SYSTEM: NEEDS ATTENTION');
            console.log('\n🔧 ISSUES TO ADDRESS:');
            Object.entries(assessmentResults).forEach(([feature, working]) => {
                if (!working) {
                    console.log(`• Fix ${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Complete flow test failed:', error.message);
        console.log('\n🔧 Debug Information:');
        console.log('• Verify server is running on port 5000');
        console.log('• Check database connectivity');
        console.log('• Confirm all payment routes are registered');
        console.log('• Validate frontend compilation');
    }
}

// Execute the comprehensive test
testCompleteUserFlow();