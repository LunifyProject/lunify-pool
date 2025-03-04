let stats;
let decimals;
let ticker;
let ranOnce = false;

// This needs to get through the API
let coinPrice = 0;
let btcPrice = 86000;

async function statsAPI() {
  stats = await api('/stats');
  decimals = stats.config.coinDecimalPlaces;
  ticker = stats.config.symbol;
}

async function pagesExecuter() {
  // Index
  if(config.api_req.index) {
    await statsParse();
    await checkAddress(getCookie("wallet_address"));
    
    // Run this once
    if(!ranOnce) {
      await createCharts();
      ranOnce = true;
    }
  }

  // Start
  if(config.api_req.start) {
    await informationParse();
  }

  // Blocks
  if(config.api_req.blocks) {
    await blocksParse();
  }

  // Payments
  if(config.api_req.payments) {
    await paymentParse();
  }

  // Miners
  if(config.api_req.miners) {
    await minersParse();
  }
}

(async() => {
  // Get stats and set global values
  setInterval(async () => {
    await statsAPI();
    await pagesExecuter();
  }, config.api_update);
  await statsAPI();
  await pagesExecuter();
})();