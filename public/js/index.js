config.api_req['index'] = true;

let chartData;

async function statsParse() {
  // Network
  doms.statNetHashrate.innerHTML = readableHashrate(stats.pool.stats.difficulty / 60) + "/s";
  doms.statNetLastBlock.innerHTML = moment(parseInt(stats.pool.stats.lastBlockFound)).fromNow();
  doms.statNetLastBlockTime.innerHTML = `${convertTimestamp(stats.pool.stats.lastBlockFound)}`;
  doms.statNetLastReward.innerHTML = `${stats.pool.stats.lastblock_lastReward / (10 ** decimals)} ${ticker}`;
  doms.statNetLastHash.innerHTML = `<a href="${config.block_url}/${stats.pool.stats.lastblock_hash}" target="_blank">${stats.pool.stats.lastblock_hash.slice(0, 5)}...${stats.pool.stats.lastblock_hash.slice(-5)}</a>`;
  doms.statNetDifficulty.innerHTML = `${parseInt(stats.pool.stats.difficulty).toLocaleString('en-us')}`;
  doms.statNetHeight.innerHTML = `${parseInt(stats.pool.stats.height).toLocaleString('en-us')}`;

  // Pool Mining
  doms.statsPoolHashrate.innerHTML = readableHashrate(stats.pool.hashrate) + "/s";
  doms.statsPoolLastBlockFound.innerHTML = moment(parseInt(stats.pool.stats.lastBlockFound_props)).fromNow();
  doms.statsPoolFoundEvery.innerHTML = readableTime(stats.network.difficulty / stats.pool.hashrate);
  doms.statsPoolBlocksFound.innerHTML = parseInt(stats.pool.stats.blocksFound).toLocaleString('en-us');
  doms.statsPoolMiners.innerHTML = `${stats.pool.miners} (${stats.pool.workers})`;
  doms.statsPoolEffort.innerHTML = (stats.pool.stats.roundShares / stats.network.difficulty * 100).toFixed(1) + '%';
  doms.statsPoolFee.innerHTML = stats.config.fees + '%';
  doms.statsPoolMinPayment.innerHTML = `${stats.config.minPaymentThreshold / (10 ** decimals)} ${ticker}`;
  doms.statsPoolPaymentInterval.innerHTML = readableTime(stats.config.paymentsInterval);

  // Solo Mining
  doms.statsSoloHashrate.innerHTML = readableHashrate(stats.pool.hashrateSolo) + "/s";
  doms.statsSoloLastBlockFound.innerHTML = moment(parseInt(stats.pool.stats.lastBlockFound_solo)).fromNow();
  doms.statsSoloFoundEvery.innerHTML = readableTime(stats.network.difficulty / stats.pool.hashrateSolo);
  doms.statsSoloBlocksFound.innerHTML = parseInt(stats.pool.stats.blocksFound_solo).toLocaleString('en-us');
  doms.statsSoloMiners.innerHTML = `${stats.pool.minersSolo} (${stats.pool.workersSolo})`;
  doms.statsSoloFee.innerHTML = stats.config.fees + '%';
  doms.statsSoloMinPayment.innerHTML = `${stats.config.minPaymentThreshold / (10 ** decimals)} ${ticker}`;
  doms.statsSoloPaymentInterval.innerHTML = readableTime(stats.config.paymentsInterval);
}

async function createCharts() {
  if (!stats || !stats.charts) {
    return;
  }
  var data = stats.charts;
  var properties = [
    'height',
    'hash',
    'timestamp',
    'difficulty',
    'shares',
    'donations',
    'reward',
    'miner',
    'poolType',
    'orphaned',
    'unlocked'
  ];
  var blocks = [];
  var solo_effort = [];
  var props_effort = [];
  var difficulties = [];


  for (var i = 0; i < stats.pool.blocks.length; i++) {
    var parts = stats.pool.blocks[i].split(':');
    var block = {};
    for (var a = 0; a < properties.length; a++) {
      var property = properties[a];
      switch (property) {
        case 'unlocked':
          block[property] = (parts[a] === true || parts[a] === 'true');
          break;
        case 'orphaned':
        case 'height':
        case 'timestamp':
        case 'difficulty':
        case 'shares':
        case 'donations':
        case 'reward':
        case 'orphaned':
          block[property] = parseInt(parts[a])
          break;
        default:
          block[property] = parts[a]
          break;
      }
    }
    var percent = Math.round(block.shares / block.difficulty * 100);
    var s = [];
    s.push(block.timestamp);
    s.push(percent);
    if (block.poolType === 'solo') {
      solo_effort.push(s);
    } else if (block.poolType === 'props') {
      props_effort.push(s);
    }
    blocks.push(s);
    difficulties.push([block.timestamp, block.difficulty]);
  }

  if (solo_effort.length === 0) {
    solo_effort.push([1612137600, 0]);
  }

  if (props_effort.length === 0) {
    props_effort.push([1612137600, 0]);
  }

  if (solo_effort.length === 1) {
    solo_effort.push(solo_effort[0]);
  }

  if (props_effort.length === 0) {
    props_effort.push(props_effort[0]);
  }

  var graphData = {
    diff: getGraphData(difficulties.reverse()),
    miners: getGraphData(data.miners),
    workers: getGraphData(data.workers),
    hashrate: getGraphData(data.hashrate),
    props_effort: getGraphData(props_effort.reverse()),
  };

  if(getCookie("wallet_address")) {
    let walletData = await api(`/stats_address?address=${getCookie("wallet_address")}`);

    if(!walletData.error) {
      graphData['hashrate_user'] = getGraphData(chartData.hashrate);
      graphData['payments_user'] = getGraphData(chartData.payments);
    }
  }

  for (var graphType in graphData) {
    let lineType = 'line';
    let ifChartLength = graphData[graphType].values.length > 1;
    if(getCookie("wallet_address") && graphType == "payments_user") {
      lineType = 'bar';
      ifChartLength = graphData[graphType].values.length >= 1
    }

    if (ifChartLength) {
      var $chart = $('#chart_' + graphType);
      var bgcolor = null, bordercolor = null, borderwidth = null;
      var colorelem = $chart.siblings('a.chart-style');
      if (colorelem.length == 1) {
        bgcolor = colorelem.css('background-color');
        bordercolor = colorelem.css('border-left-color');
        borderwidth = parseFloat(colorelem.css('width'));
      }
      if (bgcolor === null) bgcolor = 'rgba(255, 255, 255, 0.35)';
      if (bordercolor === null) bordercolor = 'rgba(255, 255, 255, 0.8)';
      if (borderwidth === null || isNaN(borderwidth)) borderwidth = 1.5;
      
      var chartObj = new Chart(document.getElementById('chart_' + graphType), {
        type: lineType,
        data: {
          labels: graphData[graphType].names,
          datasets: [{
            data: graphData[graphType].values,
            dataType: graphType,
            fill: true,
            backgroundColor: bgcolor,
            borderColor: bordercolor,
            borderWidth: borderwidth
          }]
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          legend: { display: false },
          elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 5 } },
          scales: {
            xAxes: [{
              display: false,
              ticks: { display: false },
              gridLines: { display: false }
            }],
            yAxes: [{
              display: false,
              ticks: {
                display: false,
                beginAtZero: true,
                userCallback: function (label, index, labels) {
                  if (Math.floor(label) === label) return label;
                }
              },
              gridLines: { display: false }
            }]
          },
          layout: {
            padding: { top: 5, left: 10, right: 10, bottom: 10 }
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                var dataType = data.datasets[tooltipItem.datasetIndex].dataType || '';
                var label = tooltipItem.yLabel;

                if (dataType == "hashrate" || dataType == "hashrate_user") {
                  label = readableHashrate(tooltipItem.yLabel) + '/s';
                } else if(dataType == "payments_user") {
                  label = (parseInt(tooltipItem.yLabel) / (10**decimals)).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 8 }) + " " + ticker
                } else if(dataType == "props_effort") {
                  label = formatNumber(tooltipItem.yLabel.toString(), ' ') + "%";
                } else if(dataType == "diff") {
                  label = readableHashrate(tooltipItem.yLabel, true);
                } else {
                  label = formatNumber(tooltipItem.yLabel.toString(), ' ');
                }
                return ' ' + label;
              }
            }
          }
        }
      });
      $chart.closest('.poolChart').show();
    }
  }
}

let calculateMultiplier = 1000;
async function switchHashingUnit(type) {
  if(type == "H") {
    calculateMultiplier = 1;
  } if(type == "KH") {
    calculateMultiplier = 1000;
  } if(type == "MH") {
    calculateMultiplier = 1000000;
  }

  doms.currentHashing.innerHTML = `${type}/s`;
  await calcProfits();
}

async function calcProfits() {
  let inputValue = parseFloat(doms.hashrateInput.value * calculateMultiplier);

  // If input is not a number
  if(isNaN(inputValue) || inputValue == "" || inputValue == 0) {
    doms.dailyLFI.innerHTML = `- ${ticker}`;
    doms.weeklyLFI.innerHTML = `- ${ticker}`;
    doms.monthlyLFI.innerHTML = `- ${ticker}`;
    
    doms.dailyUSD.innerHTML = `- USD`;
    doms.weeklyUSD.innerHTML = `- USD`;
    doms.monthlyUSD.innerHTML = `- USD`;
    
    doms.dailyBTC.innerHTML = `- BTC`;
    doms.weeklyBTC.innerHTML = `- BTC`;
    doms.monthlyBTC.innerHTML = `- BTC`;
    return;
  }

  let dailyProfit = dailyMiningProfit(inputValue, stats.config.coinDifficultyTarget, stats.network.difficulty, doms.alreadyMining.checked);
  let weeklyProfit = (dailyProfit * 7);
  let monthlyProfit = (dailyProfit * 30);

  doms.dailyLFI.innerHTML = `${dailyProfit.toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 4 })} ${ticker}`;
  doms.weeklyLFI.innerHTML = `${weeklyProfit.toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 4 })} ${ticker}`;
  doms.monthlyLFI.innerHTML = `${monthlyProfit.toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 4 })} ${ticker}`;
  
  doms.dailyUSD.innerHTML = `${(dailyProfit * coinPrice).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  doms.weeklyUSD.innerHTML = `${(weeklyProfit * coinPrice).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  doms.monthlyUSD.innerHTML = `${(monthlyProfit * coinPrice).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  
  doms.dailyBTC.innerHTML = `${((dailyProfit * coinPrice) / btcPrice).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 8 })} BTC`;
  doms.weeklyBTC.innerHTML = `${((weeklyProfit * coinPrice) / btcPrice).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 8 })} BTC`;
  doms.monthlyBTC.innerHTML = `${((monthlyProfit * coinPrice) / btcPrice).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 8 })} BTC`;
}

async function checkAddress(address) {
  let wallet = address || doms.miningAddress.value;

  // If wallet is empty
  if(wallet == "") {
    return;
  }

  let walletData = await api(`/stats_address?address=${wallet}`);

  if(!walletData.error) {
    // Scoresheet data
    let scoresheetDataGet = await api(`/miners_scoresheet?address=${wallet}`);
    let scoresheetData = [];
    if(scoresheetDataGet.status == "success") { scoresheetData = scoresheetDataGet.data; }

    // Kanker
    doms.removeWallet.innerHTML = `<a style="position:relative; top:-9px; left:7px;" class="fs-13" href="#!" onclick="removeWallet()">Clear wallet</a>`;

    // Payout data
    let payoutData = await api(`/get_miner_payout_level?address=${wallet}`);

    // Show Statistics
    doms.myStatsSection.classList.remove('d-none');

    // Globalize chart data
    chartData = walletData.charts;

    // Set Cookie to wallet address
    setCookie("wallet_address", wallet, 365);

    // If address parameter is set, put wallet in textbox
    if(address) {
      doms.miningAddress.value = address;
    }

    doms.myHashrate.innerHTML = readableHashrate(walletData.stats.hashrate || 0) + "/s";
    doms.myLastShare.innerHTML = moment(parseInt(walletData.stats.lastShare) * 1000).fromNow();
    doms.myTotalHashes.innerHTML = parseInt(walletData.stats.hashes).toLocaleString('en-us');
    
    let pendingBalance = parseInt(walletData.stats.balance) / (10**decimals) || 0;
    let pendingBalanceLFI = pendingBalance.toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    let pendingBalanceUSD = (pendingBalance * coinPrice).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let pendingBalanceBTC = ((pendingBalance * coinPrice) / btcPrice).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 8 });
    doms.myPendingBalanceLFI.innerHTML = pendingBalanceLFI;
    doms.myPendingBalanceUSD.innerHTML = pendingBalanceUSD;
    doms.myPendingBalanceBTC.innerHTML = pendingBalanceBTC;
    
    let payoutBalance = parseInt(walletData.stats.paid) / (10**decimals) || 0;
    let payoutBalanceLFI = payoutBalance.toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    let payoutBalanceUSD = (payoutBalance * coinPrice).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let payoutBalanceBTC = ((payoutBalance * coinPrice) / btcPrice).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 8 });
    doms.myPayoutBalanceLFI.innerHTML = payoutBalanceLFI;
    doms.myPayoutBalanceUSD.innerHTML = payoutBalanceUSD;
    doms.myPayoutBalanceBTC.innerHTML = payoutBalanceBTC;
    
    doms.myMinimumPayout.innerHTML = parseInt(walletData.stats.minPayoutLevel) / (10**decimals);
    doms.myBlockFound.innerHTML = (walletData.stats.blocksFound || 0).toLocaleString('en-us');

    let myWorkers = "";
    let onlineWorkers = 0;
    let offlineWorkers = 0;
    for(let i = 0; i < walletData.workers.length; i++) {
      let worker = walletData.workers[i];

      if(worker.hashrate == 0) {
        offlineWorkers++;
      } else {
        onlineWorkers++;
      }

      myWorkers += `
        <tr>
          <th>${(worker.hashrate == 0 ? `<i class="fas fa-times cRed"></i>` : `<i class="fas fa-plug cGreen"></i>`)}</th>
          <th>${worker.name}</th>
          <th>${worker.error_count.toLocaleString('en-us')}</th>
          <th>${readableHashrate(worker.hashrate)}/s</th>
          <th>${readableHashrate(worker.hashrate_1h || 0)}/s</th>
          <th>${worker.hashes.toLocaleString('en-us')}</th>
          <th>${worker.block_count.toLocaleString('en-us')}</th>
          <th class="text-end">${(worker.pool_type == "props" ? "Pool" : "Solo")}</th>
        </tr>
      `;
    }
    doms.myWorkers.innerHTML = myWorkers;
    doms.myOnlineMiners.innerHTML = onlineWorkers;
    doms.myOfflineMiners.innerHTML = offlineWorkers;
    
    let dailyProfit = dailyMiningProfit(parseInt(walletData.stats.hashrate), stats.config.coinDifficultyTarget, stats.network.difficulty, true);
    let weeklyProfit = (dailyProfit * 7);
    let monthlyProfit = (dailyProfit * 30);

    doms.myDailyRewardsLFI.innerHTML = `${dailyProfit.toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    doms.myDailyRewardsUSD.innerHTML = `${(dailyProfit * coinPrice).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doms.myDailyRewardsBTC.innerHTML = `${((dailyProfit * coinPrice) / btcPrice).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 7 })}`;

    doms.myWeeklyRewardsLFI.innerHTML = `${weeklyProfit.toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    doms.myWeeklyRewardsUSD.innerHTML = `${(weeklyProfit * coinPrice).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doms.myWeeklyRewardsBTC.innerHTML = `${((weeklyProfit * coinPrice) / btcPrice).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 7 })}`;

    doms.myMonthlyRewardsLFI.innerHTML = `${monthlyProfit.toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    doms.myMonthlyRewardsUSD.innerHTML = `${(monthlyProfit * coinPrice).toLocaleString('en-us', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doms.myMonthlyRewardsBTC.innerHTML = `${((monthlyProfit * coinPrice) / btcPrice).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 7 })}`;

    // My Payments
    let myPayments = "";
    for(let i = 0; i < walletData.payments.length; i++) {
      if(i < 20) {
        if (i % 2 === 0) {
          let curPay = walletData.payments[i].split(':');
          myPayments += `<tr>
            <th>${moment(parseInt(walletData.payments[i+1]) * 1000).fromNow()}</th>
            <th><code><a href="${config.tx_url}/${curPay[0]}" target="_blank">${curPay[0]}</a></code></th>
            <th><img src="/img/logo.png" style="height:17px;"> ${(parseInt(curPay[1]) / (10**decimals)).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 4 })} ${ticker}</th>
            <th>${curPay[3]}</th>
          </tr>`;
        }
      }
    }
    doms.myPayments.innerHTML = myPayments;

    // My Rewards
    let myRewards = "";
    for(let i = 0; i < scoresheetData.length; i++) {
      if(i < 20) {
        if (i % 2 === 0) {
          currentBlock = JSON.parse(scoresheetData[i]);
          myRewards += `<tr>
            <th>${currentBlock.height.toLocaleString('en-us')}</th>
            <th><img src="/img/logo.png" style="height:17px;"> ${(parseInt(currentBlock.earn) / (10**decimals)).toLocaleString('en-us', { minimumFractionDigits: 0, maximumFractionDigits: 4 })} ${ticker}</th>
            <th>${(currentBlock.percent * 100).toFixed(4)}%</th>
            <th>${parseInt((isNaN(currentBlock.shares) ? 0 : currentBlock.shares)).toLocaleString('en-us')}</th>
          </tr>`;
          console.log(currentBlock.shares);
        }
      }
    }
    doms.myRewards.innerHTML = myRewards;
    
    // Settings
    doms.setMinPayment.value = payoutData.level;
  } else {
    // Hide Statistics
    doms.myStatsSection.classList.add('d-none');
  }
}

function removeWallet() {
  setCookie('wallet_address', "");
  doms.miningAddress.value = "";
  doms.myStatsSection.classList.add('d-none');
}

async function setMinPayout() {
  let ip = doms.setIPMiner.value;
  let amount = doms.setMinPayment.value;

  let setMinPayoutawait = await api(`/set_miner_payout_level?address=fySihJLEhr2Nb4bdgGLTvTGM9joTFecLSQwyrniXfRf9gazgGystZ2LhYUMEN2jR9rdcuSvCtF5jdUcLuVyxS1L42hRNqDzix&ip=${ip}&level=${amount}`);
  let payoutData = await api(`/get_miner_payout_level?address=${getCookie('wallet_address')}`);

  // Settings
  doms.setMinPayment.value = payoutData.level;
}