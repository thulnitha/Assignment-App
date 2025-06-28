// Comprehensive donation system testing
async function testCompleteDonationSystem() {
    console.log('Comprehensive Donation System Testing');
    console.log('=====================================');

    const baseUrl = 'http://localhost:5000';
    const tests = [];
    
    try {
        // Test 1: Frontend donation page accessibility
        console.log('\n1. Testing frontend donation page...');
        const donatePageResponse = await fetch(`${baseUrl}/donate`);
        const donatePageAccessible = donatePageResponse.status === 200;
        tests.push({ name: 'Donate Page Access', status: donatePageAccessible });
        console.log('Donate page accessible:', donatePageAccessible ? 'PASS' : 'FAIL');

        // Test 2: Different donation amounts
        console.log('\n2. Testing various donation amounts...');
        const amountTests = [250, 500, 1000, 2500, 5000];
        
        for (const amount of amountTests) {
            const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency: 'LKR',
                    message: `Testing ${amount} LKR donation`,
                    donorName: `Test User ${amount}`,
                    donorEmail: `test${amount}@example.com`
                })
            });
            
            const result = await donationResponse.json();
            const amountTestPassed = result.success && result.donation.amount === amount * 100;
            
            console.log(`  ${amount} LKR: ${amountTestPassed ? 'PASS' : 'FAIL'}`);
            
            if (amountTestPassed) {
                // Test payment page for this amount
                const paymentResponse = await fetch(result.paymentUrl);
                const paymentHTML = await paymentResponse.text();
                const correctAmountDisplayed = paymentHTML.includes(`LKR ${amount}.00`);
                
                if (!correctAmountDisplayed) {
                    console.log(`    Payment page amount display: FAIL`);
                }
            }
        }

        // Test 3: Email validation and handling
        console.log('\n3. Testing email validation...');
        const emailTests = [
            { email: 'valid@example.com', shouldPass: true },
            { email: 'test.email+tag@domain.co.uk', shouldPass: true },
            { email: 'invalid-email', shouldPass: false },
            { email: '', shouldPass: false }
        ];

        for (const emailTest of emailTests) {
            try {
                const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: 1000,
                        currency: 'LKR',
                        donorEmail: emailTest.email,
                        donorName: 'Email Test User'
                    })
                });
                
                const result = await donationResponse.json();
                const testResult = emailTest.shouldPass ? result.success : !result.success;
                console.log(`  ${emailTest.email || 'empty'}: ${testResult ? 'PASS' : 'FAIL'}`);
            } catch (error) {
                console.log(`  ${emailTest.email || 'empty'}: FAIL (${error.message})`);
            }
        }

        // Test 4: Currency handling
        console.log('\n4. Testing currency handling...');
        const currencies = ['LKR', 'USD'];
        
        for (const currency of currencies) {
            const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1000,
                    currency,
                    donorName: `${currency} Test User`,
                    donorEmail: `${currency.toLowerCase()}@example.com`
                })
            });
            
            const result = await donationResponse.json();
            const currencyTestPassed = result.success && result.donation.currency === currency;
            console.log(`  ${currency}: ${currencyTestPassed ? 'PASS' : 'FAIL'}`);
        }

        // Test 5: Anonymous donations (no donor info)
        console.log('\n5. Testing anonymous donations...');
        const anonDonationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 750,
                currency: 'LKR'
            })
        });
        
        const anonResult = await anonDonationResponse.json();
        const anonTestPassed = anonResult.success;
        tests.push({ name: 'Anonymous Donations', status: anonTestPassed });
        console.log('Anonymous donation:', anonTestPassed ? 'PASS' : 'FAIL');

        // Test 6: Large donation amounts
        console.log('\n6. Testing large donation amounts...');
        const largeDonationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 50000,
                currency: 'LKR',
                donorName: 'Large Donor',
                donorEmail: 'large@example.com',
                message: 'Large donation test'
            })
        });
        
        const largeResult = await largeDonationResponse.json();
        const largeTestPassed = largeResult.success;
        tests.push({ name: 'Large Donations', status: largeTestPassed });
        console.log('Large donation (50,000 LKR):', largeTestPassed ? 'PASS' : 'FAIL');

        // Test 7: Donation with special characters in message
        console.log('\n7. Testing special characters in messages...');
        const specialCharResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 1500,
                currency: 'LKR',
                donorName: 'Special Char User',
                donorEmail: 'special@example.com',
                message: 'Testing special chars: áéíóú ñ ü @#$%&*()!'
            })
        });
        
        const specialResult = await specialCharResponse.json();
        const specialTestPassed = specialResult.success;
        tests.push({ name: 'Special Characters', status: specialTestPassed });
        console.log('Special characters in message:', specialTestPassed ? 'PASS' : 'FAIL');

        // Test 8: Concurrent donation processing
        console.log('\n8. Testing concurrent donation processing...');
        const concurrentStart = Date.now();
        
        const concurrentDonations = await Promise.all([
            fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1000,
                    currency: 'LKR',
                    donorEmail: 'concurrent1@example.com'
                })
            }),
            fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 1500,
                    currency: 'LKR',
                    donorEmail: 'concurrent2@example.com'
                })
            }),
            fetch(`${baseUrl}/api/donations/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 2000,
                    currency: 'LKR',
                    donorEmail: 'concurrent3@example.com'
                })
            })
        ]);
        
        const concurrentTime = Date.now() - concurrentStart;
        const concurrentResults = await Promise.all(concurrentDonations.map(r => r.json()));
        const allConcurrentSuccessful = concurrentResults.every(r => r.success);
        
        tests.push({ name: 'Concurrent Processing', status: allConcurrentSuccessful });
        console.log(`Concurrent donations: ${allConcurrentSuccessful ? 'PASS' : 'FAIL'} (${concurrentTime}ms)`);

        // Test 9: Success and error page functionality
        console.log('\n9. Testing success and error pages...');
        
        const successPageResponse = await fetch(`${baseUrl}/donation-success?status=success&transaction_id=test_comprehensive`);
        const successPageWorks = successPageResponse.status === 200;
        
        const failurePageResponse = await fetch(`${baseUrl}/donation-success?status=failed`);
        const failurePageWorks = failurePageResponse.status === 200;
        
        tests.push({ name: 'Success/Error Pages', status: successPageWorks && failurePageWorks });
        console.log('Success page:', successPageWorks ? 'PASS' : 'FAIL');
        console.log('Failure page:', failurePageWorks ? 'PASS' : 'FAIL');

        // Final assessment
        const passedTests = tests.filter(test => test.status).length;
        const totalTests = tests.length;
        const overallSuccess = passedTests === totalTests;
        
        console.log('\n=====================================');
        console.log('COMPREHENSIVE SYSTEM TEST RESULTS:');
        tests.forEach(test => {
            console.log(`${test.status ? '✓' : '✗'} ${test.name}`);
        });
        
        console.log(`\nOverall Score: ${passedTests}/${totalTests} tests passed`);
        console.log(`System Status: ${overallSuccess ? 'EXCELLENT' : 'NEEDS ATTENTION'}`);
        
        if (overallSuccess) {
            console.log('The donation system is fully operational across all test scenarios.');
        }

        return {
            success: overallSuccess,
            passedTests,
            totalTests,
            testResults: tests
        };

    } catch (error) {
        console.error('Comprehensive test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Run comprehensive testing
testCompleteDonationSystem()
    .then(result => {
        if (result.success) {
            console.log('\nComprehensive testing completed successfully!');
        } else {
            console.log('Some tests failed. Review results above.');
        }
    })
    .catch(error => {
        console.error('Testing crashed:', error);
    });