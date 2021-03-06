// http
//   Make an xmlrpc request
//
//   Accepts
//     - url for request
//     - data to post
//     - callback function
//   Returns
//     nothing

var http = function http(url, data, callback) {
  // Default is get
  var _requestType = "GET";
  // If data is not empty the request is a POST
  if (data) {
    _requestType = "POST";
  }
  // Create our request
  var _request = new XMLHttpRequest();
  // Open the request with the url
  _request.open(_requestType, url, true);
  // JSON
  _request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  // Create a handler for when things change
  _request.onreadystatechange = function onReadyStateChangeHandler() {
    // Skip any requests that that aren't success and ready
    if (_request.readyState !== 4 || _request.status !== 200) {
      return;
    }
    // Callback on Error with no results
    if (_request.readyState === 4 && _request.status !== 200) {
      return callback(null);
    }
    callback(_request.responseText);
  };
  // Now initiate the request
  _request.send(data);
};
