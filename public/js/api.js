// Fetch data from API 
async function api(req) {
  let response = await fetch(`${config.api_url}${req}`, {
    method: "GET"
  });

  // Return data
  let data = await response.json();
  return data;
}

// Fetch data from RPC API 
async function apiRPC(req) {
  let response = await fetch(`${config.api_rpc_url}${req}`, {
    method: "GET"
  });

  // Return data
  let data = await response.json();
  return data;
}