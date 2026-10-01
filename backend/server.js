const express = require('express');
const cors = require('cors');
const { randomUUID } = require('node:crypto');

const app = express();
app.use(cors());
app.use(express.json());

const ALLOWED_BEHAVIORS = new Set(['success', 'failure', 'slow']);

const PREDEFINED_URLS = [
  "https://yonoretail.sbi.bank.in/registration/welcome",
  "https://now.hdfc.bank.in/retail-app/",
  "https://retailnetbanking.icici.bank.in/login-page",
  "https://www.axis.bank.in/",
  "https://netbanking.kotak.bank.in/knb2/",
  "https://kite.zerodha.com/",
  "https://www.amazon.in/ap/signin",
  "https://flipkart.com/",
  "https://meesho.com/",
  "https://www.myntra.com/login",
  "https://ajio.com/",
  "https://tatacliq.com/",
  "https://snapdeal.com/",
  "https://nykaa.com/",
  "https://jiomart.com/",
  "https://croma.com/",
  "https://reliancedigital.in/",
  "https://vijaysales.com/",
  "https://lenskart.com/",
  "https://firstcry.com/",
  "https://decathlon.in/",
  "https://adidas.co.in/",
  "https://pepperfry.com/",
  "https://urbanladder.com/",
  "https://purplle.com/",
  "https://tirabeauty.com/",
  "https://bewakoof.com/",
  "https://boat-lifestyle.com/",
  "https://titan.co.in/",
  "https://tanishq.co.in/",
  "https://caratlane.com/",
  "https://mamaearth.in/",
  "https://zivame.com/",
  "https://westside.com/",
  "https://pantaloons.com/",
  "https://bigbasket.com/",
  "https://blinkit.com/",
  "https://zeptonow.com/",
  "https://dmart.in/",
  "https://naturesbasket.co.in/",
  "https://countrydelight.in/",
  "https://licious.in/",
  "https://freshtohome.com/",
  "https://1mg.com/",
  "https://pharmeasy.in/",
  "https://netmeds.com/",
  "https://apollo247.com/",
  "https://apollopharmacy.in/",
  "https://practo.com/",
  "https://medibuddy.com/",
  "https://healthifyme.com/",
  "https://cult.fit/",
  "https://swiggy.com/",
  "https://zomato.com/",
  "https://dominos.co.in/",
  "https://pizzahut.co.in/",
  "https://kfc.co.in/",
  "https://burgerking.in/",
  "https://eatsure.com/",
  "https://magicpin.in/",
  "https://eazydiner.com/",
  "https://dineout.co.in/",
  "https://yesbank.in/",
  "https://idfcfirstbank.com/",
  "https://indusind.com/",
  "https://federalbank.co.in/",
  "https://rblbank.com/",
  "https://bandhanbank.com/",
  "https://aubank.in/",
  "https://southindianbank.com/",
  "https://karnatakabank.com/",
  "https://bankofbaroda.in/",
  "https://pnbindia.in/",
  "https://canarabank.com/",
  "https://unionbankofindia.co.in/",
  "https://indianbank.in/",
  "https://bankofindia.co.in/",
  "https://centralbankofindia.co.in/",
  "https://ucobank.com/",
  "https://bankofmaharashtra.in/",
  "https://idbibank.in/",
  "https://iob.in/",
  "https://psbindia.com/",
  "https://bajajfinserv.in/",
  "https://tatacapital.com/",
  "https://mahindrafinance.com/",
  "https://shriramfinance.in/",
  "https://ltfinance.com/",
  "https://adityabirlacapital.com/",
  "https://muthootfinance.com/",
  "https://manappuram.com/",
  "https://poonawallafincorp.com/",
  "https://herofincorp.com/",
  "https://hdbfs.com/",
  "https://iifl.com/",
  "https://moneyview.in/",
  "https://navi.com/",
  "https://kreditbee.in/",
  "https://cashe.co.in/",
  "https://myfibe.com/",
  "https://lendingkart.com/",
  "https://indifi.com/",
  "https://paisabazaar.com/",
  "https://paytm.com/",
  "https://phonepe.com/",
  "https://pay.google.com/",
  "https://mobikwik.com/",
  "https://freecharge.in/",
  "https://bharatpe.com/",
  "https://cred.club/",
  "https://dashboard.razorpay.com/login",
  "https://cashfree.com/",
  "https://payu.in/",
  "https://pinelabs.com/",
  "https://instamojo.com/",
  "https://groww.in/",
  "https://upstox.com/",
  "https://angelone.in/",
  "https://icicidirect.com/",
  "https://hdfcsec.com/",
  "https://kotaksecurities.com/",
  "https://5paisa.com/",
  "https://motilaloswal.com/",
  "https://sharekhan.com/",
  "https://paytmmoney.com/",
  "https://dhan.co/",
  "https://fyers.in/",
  "https://camsonline.com/",
  "https://kfintech.com/",
  "https://policybazaar.com/",
  "https://acko.com/",
  "https://godigit.com/",
  "https://hdfcergo.com/",
  "https://icicilombard.com/",
  "https://tataaig.com/",
  "https://bajajallianz.com/",
  "https://sbigeneral.in/",
  "https://licindia.in/",
  "https://maxlifeinsurance.com/",
  "https://hdfclife.com/",
  "https://iciciprulife.com/",
  "https://sbilife.co.in/",
  "https://starhealth.in/",
  "https://careinsurance.com/",
  "https://nivabupa.com/",
  "https://makemytrip.com/",
  "https://goibibo.com/",
  "https://cleartrip.com/",
  "https://yatra.com/",
  "https://easemytrip.com/",
  "https://account.booking.com/sign-in",
  "https://agoda.com/",
  "https://www.airbnb.co.in/login",
  "https://irctc.co.in/",
  "https://redbus.in/",
  "https://abhibus.com/",
  "https://oyorooms.com/",
  "https://ixigo.com/",
  "https://uber.com/",
  "https://olacabs.com/",
  "https://rapido.bike/",
  "https://goindigo.in/",
  "https://airindia.com/",
  "https://airindiaexpress.com/",
  "https://akasaair.com/",
  "https://spicejet.com/",
  "https://emirates.com/",
  "https://qatarairways.com/",
  "https://singaporeair.com/",
  "https://etihad.com/",
  "https://britishairways.com/",
  "https://lufthansa.com/",
  "https://www.naukri.com/nlogin/login",
  "https://www.linkedin.com/login",
  "https://secure.indeed.com/auth",
  "https://foundit.in/",
  "https://apna.co/",
  "https://workindia.in/",
  "https://internshala.com/login/user",
  "https://shine.com/",
  "https://timesjobs.com/",
  "https://cutshort.io/",
  "https://hirist.tech/",
  "https://unstop.com/",
  "https://byjus.com/",
  "https://unacademy.com/",
  "https://vedantu.com/",
  "https://pw.live/",
  "https://udemy.com/",
  "https://coursera.org/",
  "https://upgrad.com/",
  "https://simplilearn.com/",
  "https://mygreatlearning.com/",
  "https://testbook.com/",
  "https://adda247.com/",
  "https://embibe.com/",
  "https://khanacademy.org/",
  "https://duolingo.com/",
  "https://jio.com/",
  "https://airtel.in/",
  "https://myvi.in/",
  "https://bsnl.co.in/",
  "https://acttv.in/",
  "https://excitel.com/",
  "https://hathway.com/",
  "https://tataplay.com/",
  "https://www.netflix.com/in/login",
  "https://primevideo.com/",
  "https://jiohotstar.com/",
  "https://sonyliv.com/",
  "https://zee5.com/",
  "https://mxplayer.in/",
  "https://hoichoi.tv/",
  "https://accounts.spotify.com/en/login",
  "https://gaana.com/",
  "https://jiosaavn.com/",
  "https://youtube.com/",
  "https://www.facebook.com/login",
  "https://www.instagram.com/accounts/login/",
  "https://x.com/i/flow/login",
  "https://www.reddit.com/login",
  "https://accounts.snapchat.com/accounts/login",
  "https://www.pinterest.com/login/",
  "https://discord.com/login",
  "https://web.telegram.org/",
  "https://web.whatsapp.com/",
  "https://digilocker.gov.in/",
  "https://web.umang.gov.in/",
  "https://eportal.incometax.gov.in/iec/foservices/#/login",
  "https://services.gst.gov.in/services/login",
  "https://unifiedportal-mem.epfindia.gov.in/",
  "https://esic.gov.in/",
  "https://passportindia.gov.in/",
  "https://myaadhaar.uidai.gov.in/",
  "https://ncs.gov.in/",
  "https://parivahan.gov.in/",
  "https://eshram.gov.in/",
  "https://myscheme.gov.in/",
  "https://mca.gov.in/",
  "https://sebi.gov.in/",
  "https://rbi.org.in/",
  "https://99acres.com/",
  "https://magicbricks.com/",
  "https://housing.com/",
  "https://nobroker.in/",
  "https://squareyards.com/",
  "https://proptiger.com/",
  "https://cardekho.com/",
  "https://carwale.com/",
  "https://spinny.com/",
  "https://cars24.com/",
  "https://olx.in/",
  "https://bikedekho.com/",
  "https://marutisuzuki.com/",
  "https://tatamotors.com/",
  "https://mahindra.com/",
  "https://toyotabharat.com/",
  "https://hondacarindia.com/",
  "https://mgmotor.co.in/",
  "https://indiamart.com/",
  "https://tradeindia.com/",
  "https://udaan.com/",
  "https://moglix.com/",
  "https://alibaba.com/",
  "https://accounts.zoho.in/signin",
  "https://freshworks.com/",
  "https://login.salesforce.com/",
  "https://app.hubspot.com/login",
  "https://accounts.google.com/signin",
  "https://mail.google.com/",
  "https://login.microsoftonline.com/",
  "https://outlook.live.com/",
  "https://onedrive.live.com/",
  "https://teams.microsoft.com/",
  "https://www.dropbox.com/login",
  "https://www.canva.com/login",
  "https://www.notion.so/login",
  "https://slack.com/signin",
  "https://zoom.us/signin",
  "https://github.com/login",
  "https://gitlab.com/users/sign_in",
  "https://id.atlassian.com/login",
  "https://trello.com/login",
  "https://app.asana.com/-/login",
  "https://auth.monday.com/login",
  "https://delhivery.com/",
  "https://bluedart.com/",
  "https://dtdc.in/",
  "https://ecomexpress.in/",
  "https://xpressbees.com/",
  "https://app.shiprocket.in/login",
  "https://porter.in/",
  "https://shadowfax.in/",
  "https://ekartlogistics.com/",
  "https://indiapost.gov.in/",
  "https://tatapower.com/",
  "https://adanielectricity.com/",
  "https://bsesdelhi.com/",
  "https://mahadiscom.in/",
  "https://iglonline.net/",
  "https://mahanagargas.com/",
  "https://fastag.ihmcl.com/",
  "https://djb.gov.in/"
];

app.get('/api/urls', (_req, res) => {
  res.json({ urls: PREDEFINED_URLS });
});

function mockOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function simulateSite(url, phone) {
  const roll = Math.random();
  const responseMs = 120 + Math.floor(Math.random() * 600);
  // ~75% sites trigger successfully, ~15% reject, ~10% timeout
  if (roll < 0.75) {
    return { url, phone, triggered: true, stage: 'otp_sent', otp: mockOtp(), responseMs, reason: 'OTP dispatched to number' };
  } else if (roll < 0.90) {
    return { url, phone, triggered: false, stage: 'login_rejected', otp: null, responseMs, reason: 'Login page did not accept the number' };
  } else {
    return { url, phone, triggered: false, stage: 'timeout', otp: null, responseMs: 3000 + Math.floor(Math.random() * 500), reason: 'Site did not respond in time' };
  }
}

app.post('/api/simulate', (req, res) => {
  const { targets, country, region } = req.body || {};

  if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country) ||
      typeof region !== 'string' || region.length < 1 || region.length > 80) {
    return res.status(400).json({ error: 'Choose a valid country and region.' });
  }
  if (!Array.isArray(targets) || targets.length < 1 || targets.length > 300) {
    return res.status(400).json({ error: 'Provide between 1 and 300 mock targets.' });
  }
  if (targets.some(t => !t || !ALLOWED_BEHAVIORS.has(t.behavior))) {
    return res.status(400).json({ error: 'Each target needs a supported mock behavior.' });
  }

  const results = targets.map((target, index) => ({
    index,
    status: target.behavior === 'success' ? 'accepted' : target.behavior === 'slow' ? 'timeout' : 'rejected',
    responseMs: target.behavior === 'slow'
      ? 2500 + Math.floor(Math.random() * 500)
      : 180 + Math.floor(Math.random() * 520)
  }));

  res.json({
    requestId: randomUUID(),
    mode: 'mock',
    context: { country, region },
    results,
    event: { type: 'otp.simulation.completed', status: 'simulated', sent: false }
  });
});

app.post('/api/trigger', (req, res) => {
  const { phone, country, region, urls } = req.body || {};

  if (typeof phone !== 'string' || !/^\+?[\d ()-]{7,18}$/.test(phone.trim())) {
    return res.status(400).json({ error: 'Provide a valid phone number.' });
  }
  if (typeof country !== 'string' || !/^[A-Z]{2}$/.test(country)) {
    return res.status(400).json({ error: 'Provide a valid country code.' });
  }
  if (typeof region !== 'string' || region.length < 1) {
    return res.status(400).json({ error: 'Provide a region.' });
  }

  const targetUrls = Array.isArray(urls) && urls.length > 0 ? urls : PREDEFINED_URLS;

  const results = targetUrls.map(url => simulateSite(url, phone.trim()));
  const triggered = results.filter(r => r.triggered).length;

  res.json({
    requestId: randomUUID(),
    mode: 'mock',
    phone: phone.trim(),
    context: { country, region },
    summary: { total: results.length, triggered, notTriggered: results.length - triggered },
    results,
    event: { type: 'otp.trigger.completed', status: 'simulated', sent: false }
  });
});

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT} with ${PREDEFINED_URLS.length} predefined URLs`));
}

module.exports = app;
