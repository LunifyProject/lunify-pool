config.api_req['blocks'] = true;

function blocksParse() {
  doms.poolTotalBlocks.innerHTML = `${stats.pool.stats.blocksFound_props || 0}   ${(stats.pool.stats.lastBlockFound_props ? `(${moment(parseInt(stats.pool.stats.lastBlockFound_props)).fromNow()})` : '')}`;
  doms.poolAverageLuck.innerHTML = `${formatLuck(stats.pool.stats.totalDiff_props, stats.pool.stats.totalShares_props)}`;
  doms.poolCurrentEffort.innerHTML = `${(stats.pool.stats.roundSharesprops / stats.network.difficulty * 100).toFixed(1)}%`;
  doms.poolHashes.innerHTML = `${parseInt(stats.pool.stats.totalShares_props || 0).toLocaleString('en-us')}`;

  doms.soloTotalBlocks.innerHTML = `${stats.pool.stats.blocksFound_solo || 0}   ${(stats.pool.stats.lastBlockFound_solo ? `(${moment(parseInt(stats.pool.stats.lastBlockFound_props)).fromNow()})` : '')}`;
  doms.soloAverageLuck.innerHTML = `${formatLuck(stats.pool.stats.totalDiff_solo, stats.pool.stats.totalShares_solo)}`;
  doms.soloCurrentEffort.innerHTML = `${(stats.pool.stats.roundSharessolo / stats.network.difficulty * 100).toFixed(1)}%`;
  doms.soloHashes.innerHTML = `${parseInt(stats.pool.stats.totalShares_solo || 0).toLocaleString('en-us')}`;

  let blocks = "";
  for(let i = 0; i < stats.pool.blocks.length; i++) {
    if(i < 70) {
      let block = stats.pool.blocks[i].split(':');
      let maturity = stats.config.depth - (stats.network.height - (parseInt(block[0])-1));
      
      blocks += `<tr>
        <th>${parseInt(block[0]).toLocaleString('en-us')}</th>
        <th>${moment(parseInt(block[2] * 1000)).fromNow()}</th>
        <th><img src="/img/logo.png" style="height:17px;"> ${(parseInt(block[6]) / (10**decimals)).toLocaleString('en-us', { minimumFractionDigits: 4, maximumFractionDigits: 8 })}</th>
        <th>${parseInt(block[3]).toLocaleString('en-us')}</th>
        <th><code><a href="${config.block_url}/${block[1]}" target="_blank">${block[1].slice(0, 5)}...${block[1].slice(-5)}</code></th>
        <th>${formatLuck(parseInt(block[3]), parseInt(block[4]))}</th>
        <th class="text-center">${maturity > 0 ? '<i class="fas fa-spinner spinner"></i>' : '<i class="fas fa-unlock-alt"></i>'}</th>
        <th><code>${block[7]}</code></th>
        <th>${parseInt(block[4]).toLocaleString('en-us')}</th>
        <th>${(block[8] == "props" ? 'Pool' : 'Solo')}</th>
      </tr>`;
    }
  }

  doms.minedBlocks.innerHTML = blocks;
}