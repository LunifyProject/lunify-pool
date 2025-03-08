config.api_req['payments'] = true;

function paymentParse() {
  doms.payTotalPayments.innerHTML = `${stats.pool.totalPayments || 0} (${stats.pool.totalMinersPaid || 0} miners)`;
  doms.payMaximumPayout.innerHTML = `<img src="/img/logo.png" style="height:17px;"> ${parseInt(stats.config.maxPaymentThreshold) / (10**decimals)} ${ticker}`;
  doms.payMinimumPayout.innerHTML = `<img src="/img/logo.png" style="height:17px;"> ${parseInt(stats.config.minPaymentThreshold) / (10**decimals)} ${ticker}`;
  doms.payPaymentInterval.innerHTML = `${formatTime(stats.config.paymentsInterval)}`;

  let payments = "";
  for(let i = 0; i < stats.pool.payments.length; i++) {
    if (i % 2 === 0) {
      try {
        if(i < 120) {
          let payment = stats.pool.payments[i].split(':');
          
          payments += `<tr>
            <th>${moment(parseInt(stats.pool.payments[i+1]) * 1000).fromNow()}</th>
            <th><code><a href="${config.tx_url}/${payment[0]}" target="_blank">${payment[0].slice(0, 5)}...${payment[0].slice(-5)}</code></th>
            <th><img src="/img/logo.png" style="height:17px;"> ${(parseInt(payment[1]) / (10**decimals)).toLocaleString('en-us', { minimumFractionDigits: 4, maximumFractionDigits: 8 })}</th>
            <th>${(parseInt(payment[2]) / (10**decimals)).toLocaleString('en-us', { minimumFractionDigits: 4, maximumFractionDigits: 8 })} ${ticker}</th>
            <th>${payment[3]}</th>
            <th>${payment[4]}</th>
          </tr>`;
        }
      } catch(e) {
        console.error(e);
        return;
      }
    }
  }

  doms.payedPayments.innerHTML = payments;
}