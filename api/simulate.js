const { randomUUID } = require('node:crypto');

module.exports = (request, response) => {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  let body = request.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (_) {
      return response.status(400).json({ error: 'Request body must be valid JSON.' });
    }
  }

  const targets = body && body.targets;
  const country = body && body.country;
  const region = body && body.region;
  const allowedBehaviors = new Set(['success', 'failure', 'slow']);
  if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country) || typeof region !== 'string' || region.length < 1 || region.length > 80) {
    return response.status(400).json({ error: 'Choose a valid country and region.' });
  }
  if (!Array.isArray(targets) || targets.length < 1 || targets.length > 25) {
    return response.status(400).json({ error: 'Provide between 1 and 25 mock targets.' });
  }
  if (targets.some(target => !target || !allowedBehaviors.has(target.behavior))) {
    return response.status(400).json({ error: 'Each target needs a supported mock behavior.' });
  }

  const results = targets.map((target, index) => {
    const responseMs = target.behavior === 'slow'
      ? 2500 + Math.floor(Math.random() * 500)
      : 180 + Math.floor(Math.random() * 520);
    const status = target.behavior === 'success'
      ? 'accepted'
      : target.behavior === 'slow' ? 'timeout' : 'rejected';
    return { index, status, responseMs };
  });

  return response.status(200).json({
    requestId: randomUUID(),
    mode: 'mock',
    context: { country, region },
    results,
    event: {
      type: 'otp.simulation.completed',
      status: 'simulated',
      sent: false
    }
  });
};