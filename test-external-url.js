// Test external Replit URL functionality
const baseUrl = 'https://078809a0-7c28-481a-b436-4116774afcc9-00-2iz5xyaibz04i.spock.replit.dev';

async function testExternalAccess() {
    console.log('Testing external Replit URL access...');
    console.log('Base URL:', baseUrl);
    
    try {
        // Test 1: Basic connectivity
        console.log('\n1. Testing basic connectivity...');
        const healthResponse = await fetch(`${baseUrl}/`);
        console.log('Homepage status:', healthResponse.status);
        
        // Test 2: API endpoint
        console.log('\n2. Testing donation creation API...');
        const donationResponse = await fetch(`${baseUrl}/api/donations/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 1500,
                currency: 'LKR',
                message: 'External URL test',
                donorName: 'External Test User',
                donorEmail: 'external@test.com'
            })
        });
        
        console.log('API status:', donationResponse.status);
        
        if (donationResponse.ok) {
            const result = await donationResponse.json();
            console.log('API response success:', result.success);
            
            if (result.success && result.paymentUrl) {
                const reference = result.paymentUrl.split('/').pop();
                console.log('Payment reference:', reference);
                
                // Test 3: Payment page access
                console.log('\n3. Testing payment page access...');
                const paymentPageResponse = await fetch(result.paymentUrl.replace('localhost:5000', '078809a0-7c28-481a-b436-4116774afcc9-00-2iz5xyaibz04i.spock.replit.dev'));
                console.log('Payment page status:', paymentPageResponse.status);
                
                // Test 4: Production payment page
                console.log('\n4. Testing production payment page...');
                const productionUrl = `${baseUrl}/payment/onepay/${reference}`;
                const productionResponse = await fetch(productionUrl);
                console.log('Production page status:', productionResponse.status);
                
                if (productionResponse.ok) {
                    const content = await productionResponse.text();
                    const hasPaymentForm = content.includes('Pay with OnePay Gateway');
                    console.log('Has payment form:', hasPaymentForm);
                }
                
                console.log('\n✅ External URL testing complete');
                console.log('\nFor Postman, use these working URLs:');
                console.log(`POST ${baseUrl}/api/donations/create`);
                console.log(`GET  ${baseUrl}/onepay/direct/${reference}`);
                console.log(`GET  ${baseUrl}/payment/onepay/${reference}`);
            }
        } else {
            const errorText = await donationResponse.text();
            console.log('API error:', errorText);
        }
        
    } catch (error) {
        console.error('External URL test failed:', error.message);
    }
}

testExternalAccess();