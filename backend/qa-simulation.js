function maskMobile(number) {
  const value = String(number);

  if (value.length < 4) {
    return '****';
  }

  return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
}

function simulateSite(site, mobileNumber, options = {}) {
  const {
    minDelay = 300,
    maxDelay = 1200,
    successRate = 0.85,
    generateOtp = true
  } = options;

  return new Promise((resolve) => {
    const startedAt = Date.now();
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    setTimeout(() => {
      const success = Math.random() < successRate;
      const mockOtp = generateOtp && success
        ? String(Math.floor(100000 + Math.random() * 900000))
        : null;

      resolve({
        requestId: `QA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        siteId: site.id,
        siteName: site.name,
        mobileNumber: maskMobile(mobileNumber),
        environment: 'QA',
        status: success ? 'SUCCESS' : 'FAILED',
        otp: mockOtp,
        responseCode: success ? '200' : '500',
        message: success
          ? 'OTP request simulated successfully'
          : 'Simulated provider failure',
        processingTimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString()
      });
    }, delay);
  });
}

async function simulateAllSites(mobileNumber, sites) {
  const startedAt = Date.now();
  const results = await Promise.allSettled(
    sites.map(site => simulateSite(site, mobileNumber, {
      minDelay: 300,
      maxDelay: 1500,
      successRate: 0.9
    }))
  );

  return {
    environment: 'QA',
    mobileNumber: maskMobile(mobileNumber),
    totalSites: sites.length,
    successful: results.filter(
      result => result.status === 'fulfilled' && result.value.status === 'SUCCESS'
    ).length,
    failed: results.filter(
      result => result.status === 'fulfilled' && result.value.status === 'FAILED'
    ).length,
    durationMs: Date.now() - startedAt,
    results: results.map(result => result.status === 'fulfilled'
      ? result.value
      : {
          status: 'ERROR',
          message: result.reason?.message || 'Unknown error'
        })
  };
}

module.exports = { simulateSite, maskMobile, simulateAllSites };