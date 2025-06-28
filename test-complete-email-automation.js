// Comprehensive Email Automation Test Script
// Tests all notification systems: signup, submission, analysis, and monthly reports

async function testCompleteEmailAutomation() {
  console.log('🚀 Starting comprehensive email automation test...');
  
  try {
    // Test email automation endpoint
    const response = await fetch('/api/admin/test-email-automation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('📧 Email Automation Test Results:');
    console.log('================================');
    console.log(`Registration Notifications: ${result.results.registration ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Submission Notifications: ${result.results.submission ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Analysis Notifications: ${result.results.analysis ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Monthly Reports: ${result.results.monthly ? '✅ WORKING' : '❌ FAILED'}`);
    console.log('================================');
    console.log(`Overall Success Rate: ${result.summary.passed}/${result.summary.total} (${(result.summary.passed/result.summary.total*100).toFixed(1)}%)`);
    
    return result;
  } catch (error) {
    console.error('❌ Email automation test failed:', error);
    return null;
  }
}

// Test monthly report for specific user
async function testMonthlyReportForUser(userId) {
  console.log(`🧪 Testing monthly report for user ${userId}...`);
  
  try {
    const response = await fetch(`/api/admin/test-monthly-report/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📊 Monthly report test: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    return result;
  } catch (error) {
    console.error('❌ Monthly report test failed:', error);
    return null;
  }
}

// Send monthly reports to all users
async function sendAllMonthlyReports() {
  console.log('📮 Sending monthly reports to all eligible users...');
  
  try {
    const response = await fetch('/api/admin/send-all-monthly-reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📈 Monthly reports sent: ${result.results.sent}, Failed: ${result.results.failed}`);
    
    return result;
  } catch (error) {
    console.error('❌ Monthly reports failed:', error);
    return null;
  }
}

// Run comprehensive test suite
async function runEmailAutomationSuite() {
  console.log('🎯 Running complete email automation test suite...');
  
  // Test all email systems
  const automationResults = await testCompleteEmailAutomation();
  
  if (automationResults) {
    // Test monthly report for admin user (ID: 43256163)
    await testMonthlyReportForUser('43256163');
    
    // Test monthly reports for all users
    await sendAllMonthlyReports();
  }
  
  console.log('✅ Email automation test suite completed!');
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.testCompleteEmailAutomation = testCompleteEmailAutomation;
  window.testMonthlyReportForUser = testMonthlyReportForUser;
  window.sendAllMonthlyReports = sendAllMonthlyReports;
  window.runEmailAutomationSuite = runEmailAutomationSuite;
  
  console.log('📧 Email automation testing functions loaded:');
  console.log('- testCompleteEmailAutomation()');
  console.log('- testMonthlyReportForUser(userId)');
  console.log('- sendAllMonthlyReports()');
  console.log('- runEmailAutomationSuite()');
}

// Auto-run if this is being executed directly
if (typeof module !== 'undefined' && require.main === module) {
  runEmailAutomationSuite();
}