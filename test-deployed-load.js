const https = require('https');
const fs = require('fs');

// Deployed URL
const BASE_URL = 'https://mystudysync.vercel.app';
const API_ENDPOINT = '/api/study-materials'; // Public endpoint that doesn't need auth
const CONCURRENT_USERS = 50; // Lower for deployed to avoid DDoS detection
const REQUESTS_PER_USER = 5; // Fewer requests per user

let results = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: Date.now(),
};

function makeRequest() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const url = new URL(API_ENDPOINT, BASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Load-Tester/1.0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        results.totalRequests++;
        results.responseTimes.push(responseTime);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          results.successfulRequests++;
        } else {
          results.failedRequests++;
          results.errors.push(`Status Code: ${res.statusCode}`);
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      results.totalRequests++;
      results.failedRequests++;
      results.errors.push(error.message);
      resolve();
    });

    req.setTimeout(10000, () => {
      results.failedRequests++;
      results.errors.push('Timeout');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runLoadTest() {
  console.log('🚀 Testing Deployed API Load');
  console.log('============================\n');
  console.log(`📊 Configuration:`);
  console.log(`   - URL: ${BASE_URL}`);
  console.log(`   - Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`   - Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`   - Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  console.log(`   - Endpoint: ${API_ENDPOINT}`);
  console.log(`   - Starting test...\n`);

  // Run concurrent requests
  for (let user = 0; user < CONCURRENT_USERS; user++) {
    for (let req = 0; req < REQUESTS_PER_USER; req++) {
      makeRequest();
      // Stagger requests slightly
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }

  // Wait for all requests to complete
  console.log(`Waiting for all requests to complete...`);
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Generate report
  generateReport();
}

function generateReport() {
  const totalTime = Date.now() - results.startTime;
  const responseTimes = results.responseTimes.sort((a, b) => a - b);
  
  if (responseTimes.length === 0) {
    console.log('\n❌ No successful responses recorded.');
    return;
  }

  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const min = Math.min(...responseTimes);
  const max = Math.max(...responseTimes);
  const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
  const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
  const successRate = ((results.successfulRequests / results.totalRequests) * 100).toFixed(2);
  const throughput = (results.totalRequests / (totalTime / 1000)).toFixed(2);

  const report = {
    timestamp: new Date().toISOString(),
    testConfiguration: {
      concurrentUsers: CONCURRENT_USERS,
      requestsPerUser: REQUESTS_PER_USER,
      totalRequests: results.totalRequests,
      url: BASE_URL,
      endpoint: API_ENDPOINT,
    },
    results: {
      totalTimeMs: totalTime,
      successfulRequests: results.successfulRequests,
      failedRequests: results.failedRequests,
      successRate: `${successRate}%`,
      throughput: `${throughput} requests/sec`,
    },
    responseTimeAnalysis: {
      minMs: min,
      maxMs: max,
      avgMs: avg.toFixed(2),
      p95Ms: p95,
      p99Ms: p99,
    },
    topErrors: results.errors.slice(0, 5),
  };

  // Print to console
  console.log('\n✅ Load Test Completed!\n');
  console.log('📈 Results:');
  console.log(JSON.stringify(report, null, 2));

  // Save to file
  fs.writeFileSync('deployed-load-test-results.json', JSON.stringify(report, null, 2));
  console.log('\n💾 Results saved to: deployed-load-test-results.json');
}

// Run the test
runLoadTest().catch(console.error);
