let numberFormatter = new Intl.NumberFormat('en-US');
function localizeNumber(number) {
  return numberFormatter.format(number);
};

function readableHashrate(hashrate, difficulty) {
  let i = 0;
  let byteUnits;
  if (difficulty) {
    byteUnits = [' ', ' K', ' M', ' G', ' T', ' P', ' E', ' Z', ' Y'];
  } else {
    byteUnits = [' H', ' KH', ' MH', ' GH', ' TH', ' PH', ' EH', ' ZH', ' YH'];
  }

  while (hashrate > 1000) {
    hashrate = hashrate / 1000;
    i++;
  }

  return localizeNumber(hashrate.toFixed(2)) + byteUnits[i];
}

function readableBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizes[i]}`;
}

function readableTime(seconds) {
  var units = [[60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4, 'week'], [12, 'month'], [1, 'year']];

  function formatAmounts(amount, unit) {
    var rounded = Math.round(amount);
    var unit = unit + (rounded > 1 ? 's' : '');
    return '' + rounded + ' ' + unit;
  }

  let amount = seconds;
  for (var i = 0; i < units.length; i++) {
    if (amount < units[i][0]) {
      return formatAmounts(amount, units[i][1]);
    }
    amount = amount / units[i][0];
  }

  return formatAmounts(amount, units[units.length - 1][1]);
}

function formatNumber(number, delimiter) {
  if (number != '') {
    number = number.split(delimiter).join('');

    var formatted = '';
    var sign = '';

    if (number < 0) {
      number = -number;
      sign = '-';
    }

    while (number >= 1000) {
      var mod = number % 1000;

      if (formatted != '') formatted = delimiter + formatted;
      if (mod == 0) formatted = '000' + formatted;
      else if (mod < 10) formatted = '00' + mod + formatted;
      else if (mod < 100) formatted = '0' + mod + formatted;
      else formatted = mod + formatted;

      number = parseInt(number / 1000);
    }

    if (formatted != '') formatted = sign + number + delimiter + formatted;
    else formatted = sign + number;
    return formatted;
  }
  return '';
}

function getGraphData(rawData) {
  var graphData = {
    names: [],
    values: []
  };
  if (rawData) {
    for (var i = 0, xy; xy = rawData[i]; i++) {
      graphData.names.push(new Date(xy[0] * 1000).toLocaleString());
      graphData.values.push(xy[1]);
    }
  }
  return graphData;
}

function getCookie(name) {
  let nameEQ = name + "=";
  let cookies = document.cookie.split("; ");
  for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookies[i].substring(nameEQ.length));
    }
  }
  return null;
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function dailyMiningProfit(hashrate, difficultyTarget, difficulty, alreadyMining = true) {
  let blockTime = difficultyTarget;
  let blocksPerDay = 86400 / blockTime;
  let blockReward = 8;

  let networkHashrate = difficulty / blockTime;
  let minerShare = hashrate / networkHashrate;

  // Already mining
  if (alreadyMining) {
    if (minerShare > 1) { minerShare = 1; }
  } else {
    networkHashrate += hashrate;
    minerShare = hashrate / (networkHashrate);
  }

  let dailyProfit = (minerShare * blocksPerDay * blockReward);

  return dailyProfit;
}

// TODO
function getBlockReward(height) {
  return 8;
}

function formatLuck(difficulty, shares) {
  var percent = Math.round(shares / difficulty * 100);
  if (!percent) {
    return '<span class="badge bg-green">?</span>';
  }
  else if (percent <= 100) {
    return '<span class="badge bg-green">' + percent + '%</span>';
  }
  else if (percent >= 101 && percent <= 150) {
    return '<span class="badge bg-orange">' + percent + '%</span>';
  }
  else {
    return '<span class="badge bg-blue">' + percent + '%</span>';
  }
}

function formatTime(seconds) {
  if (seconds >= 3600) {
    return (seconds / 3600) % 1 === 0
      ? (seconds / 3600) + ' hour'
      : (seconds / 3600) + ' hours';
  } else if (seconds >= 60) {
    return (seconds / 60) + ' minutes';
  } else {
    return seconds + ' seconds';
  }
}