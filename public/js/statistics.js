let currentHeight = 0;

async function getInfo() {
  let infoData = await api('/networkinfo');
  let poolData = await api('/mempool');
  infoData = infoData.data;
  poolData = poolData.data;

  currentHeight = infoData.height;
  let hashrateVal = infoData.difficulty / infoData.target;

  let totalTxPoolSize = 0;
  if(poolData.txs) {
    for(let i = 0; i < poolData.txs.length; i++) {
      totalTxPoolSize += poolData.txs[i].tx_size;
    }
  }

  doms.blockHeight.innerHTML = infoData.height.toLocaleString('en-us');
  doms.difficulty.innerHTML = infoData.difficulty.toLocaleString('en-us');
  doms.hashrate.innerHTML = readableHashrate(hashrateVal) + '/s';
  doms.txCount.innerHTML = infoData.tx_count.toLocaleString('en-us');
  doms.txPoolSize.innerHTML = infoData.tx_pool_size.toLocaleString('en-us');
  doms.txSize.innerHTML = readableBytes(totalTxPoolSize);
  doms.conIn.innerHTML = infoData.incoming_connections_count.toLocaleString('en-us');
  doms.conOut.innerHTML = infoData.outgoing_connections_count.toLocaleString('en-us');
}