config.api_req['start'] = true;

function informationParse() {
  doms.miningPoolAddress.innerHTML = `${config.mining_address}`;
  doms.miningAlgorithm.innerHTML = `${config.algorithm}`;

  let miningPorts = "";
  let miningPortsList = "";
  for(i = 0; i < stats.config.ports.length; i++) {
    miningPorts += `<tr>
      <th>${stats.config.ports[i].port}</th>
      <th>${stats.config.ports[i].difficulty.toLocaleString('en-us')}</th>
      <th>${stats.config.ports[i].desc}</th>
      <th>${(parseInt(stats.config.ports[i].port) == 9999 ? `
          <span class="badge bg-themeDark">Solo</span>
        ` : `
          <span class="badge bg-theme">Pool</span>
      `)}</th>
    </tr>`;

    miningPortsList += `<option value="${stats.config.ports[i].port}"${i == 0 ? ' selected' : ''}>${stats.config.ports[i].port} - ${stats.config.ports[i].desc}</option>`
  }
  doms.miningPorts.innerHTML = miningPorts;
  doms.miningPortsList.innerHTML = miningPortsList;
}

function showInfos(generate) {
  // If generate
  if(generate) {
    doms.LFIRig.classList.remove('d-none');

    doms.confPoolAddress.innerHTML = `${config.mining_address}`;

    if(!(doms.confWalletAddressInput.value == "")) {
      doms.confWalletAddress.innerHTML = `${doms.confWalletAddressInput.value}`;
    }
    
    doms.confPort.innerHTML = `${doms.miningPortsList.value}`;
    
    // Worker Name
    if(!(doms.confWorkerNameInput.value == "")) {
      doms.confPassword.innerHTML = `${doms.confWorkerNameInput.value}`;

      // Payment ID
      if(!(doms.confPaymentIDInput.value == "")) {
        doms.confPassword.innerHTML += `.${doms.confPaymentIDInput.value}`;
      }

      // Fixed Difficulty
      if(!(doms.confFixedDifficultyInput.value == "")) {
        doms.confPassword.innerHTML += `+${doms.confFixedDifficultyInput.value}`;
      }
    }
    return;
  }
  
  // If show info
  if(doms.LFIRig.classList.value.includes('d-none')) {
    doms.LFIRig.classList.remove('d-none');
    return;
  } else {
    doms.LFIRig.classList.add('d-none');
    return;
  }
}

function download(type) {
  if(type == "cli") {
    window.open('https://github.com/LunifyProject/LFIrig/releases/latest');
  } else if(type == "mobile") {
    window.open('https://github.com/LunifyProject/LunifyVault/releases/latest');
  }
}