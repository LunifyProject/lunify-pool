config.api_req['miners'] = true;

async function minersParse() {
  let payments = "";
  
  let topMinersData = await api('/get_top10');
  let topMiners = [];
  if(topMinersData.status == "success") {
    topMiners = topMinersData.data.miner;
  }

  // Sort array
  topMiners.sort((a, b) => b.hashes - a.hashes);

  let miners = "";
  for(let i = 0; i < topMiners.length; i++) {
    if(i < 25) {
      console.log(topMiners[i]);
      miners += `<tr>
        <th>${i+1}</th>
        <th>${topMiners[i].miner}</th>
        <th>${readableHashrate(topMiners[i].hashrate)}/s</th>
        <th>${parseInt(topMiners[i].hashes).toLocaleString('en-us')}</th>
        <th>${moment(topMiners[i].lastShare * 1000).fromNow()}</th>
        <th>${topMiners[i].blocksFound.toLocaleString('en-us')}</th>
      </tr>`;
    }
  }

  doms.topMiners.innerHTML = miners;
}