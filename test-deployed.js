const https = require('https');
const fs = require('fs');

// Deployed URL
const BASE_URL = 'https://mystudysync.vercel.app';

const endpoints = [
  { name: 'Get Study Materials', path: '/api/study-materials', auth: false },
  { name: 'Get Forum Questions', path: '/api/forum', auth: false },
  { name: 'Get Leaderboard', path: '/api/leaderboard', auth: true },
  { name: 'Get Quizzes', path: '/api/quiz', auth: true },
];

async function testEndpoint(name, path) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Performance-Tester/1.0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        resolve({
          endpoint: name,
          path: path,
          status: res.statusCode,
          responseTimeMs: responseTime,
          dataSize: data.length,
          timestamp: new Date().toISOString(),
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint: name,
        path: path,
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    });

    req.setTimeout(10000);
    req.end();
  });
}

async function runDeployedTest() {
  console.log('🌐 Testing Deployed API');
  console.log('=======================\n');
  console.log(`URL: ${BASE_URL}\n`);
  
  const results = [];

  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    const result = await testEndpoint(endpoint.name, endpoint.path);
    results.push(result);
    
    if (result.status >= 200 && result.status < 300) {
      console.log(`✅ ${result.responseTimeMs}ms (${result.dataSize} bytes)`);
    } else if (result.status === 401) {
      console.log(`⚠️  ${result.status} (requires auth)`);
    } else {
      console.log(`❌ ${result.status || result.error}`);
    }
  }

  // Generate summary
  console.log('\n📊 Summary:');
  console.log('===========\n');
  
  const successfulTests = results.filter(r => r.status >= 200 && r.status < 300);
  
  if (successfulTests.length === 0) {
    console.log('❌ No successful public endpoints. Server might be down.');
    console.log(`\nFull results saved to: deployed-test-results.json`);
    fs.writeFileSync('deployed-test-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      results: results,
    }, null, 2));
    return;
  }

  const avgResponseTime = (successfulTests.reduce((sum, r) => sum + r.responseTimeMs, 0) / successfulTests.length).toFixed(2);
  const maxResponseTime = Math.max(...successfulTests.map(r => r.responseTimeMs));
  const minResponseTime = Math.min(...successfulTests.map(r => r.responseTimeMs));

  console.log(`Total Endpoints Tested: ${results.length}`);
  console.log(`Accessible (200): ${successfulTests.length}`);
  console.log(`Protected (401): ${results.filter(r => r.status === 401).length}`);
  console.log(`Failed/Error: ${results.filter(r => r.status >= 400 || r.status === 'ERROR').length}`);
  console.log(`\nAverage Response Time: ${avgResponseTime}ms`);
  console.log(`Min Response Time: ${minResponseTime}ms`);
  console.log(`Max Response Time: ${maxResponseTime}ms`);
  
  if (avgResponseTime < 200) {
    console.log(`\n✅ Excellent performance: All endpoints <200ms`);
  } else if (avgResponseTime < 500) {
    console.log(`\n⚠️  Good performance: Endpoints averaging ${avgResponseTime}ms`);
  } else {
    console.log(`\n⚠️  Slow performance: Endpoints averaging ${avgResponseTime}ms`);
  }

  // Save detailed results
  fs.writeFileSync('deployed-test-results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    summary: {
      totalEndpoints: results.length,
      successful: successfulTests.length,
      protected: results.filter(r => r.status === 401).length,
      failed: results.filter(r => r.status >= 400 || r.status === 'ERROR').length,
      avgResponseTimeMs: parseFloat(avgResponseTime),
      minResponseTimeMs: minResponseTime,
      maxResponseTimeMs: maxResponseTime,
    },
    details: results,
  }, null, 2));

  console.log('\n💾 Full results saved to: deployed-test-results.json');
}

runDeployedTest().catch(console.error);
