const querystring = require("querystring");

const variables = {
  webpExtension: "webp"
};

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // parse the querystrings key-value pairs. In our case it would be d=100x100
  const params = querystring.parse(request.querystring);

  // fetch the uri of original image
  let fwdUri = request.uri;

  // if there is no dimension attribute, just pass the request
  if (!params.d) {
    callback(null, request);
    return;
  }
  // read the dimension parameter value = width x height and split it by 'x'
  const dimensionMatch = params.d.split("x");

  // set the width and height parameters
  let width = dimensionMatch[0];
  let height = dimensionMatch[1];

  // parse the prefix, image name and extension from the uri.
  // In our case /images/image.jpg

  const match = fwdUri.match(/(.*)\/(.*)\.(.*)/);

  let prefix = match[1];
  let imageName = match[2];
  let extension = match[3];

  // read the accept header to determine if webP is supported.
  let accept = headers["accept"] ? headers["accept"][0].value : "";

  let url = [];
  // build the new uri to be forwarded upstream
  url.push(prefix);
  url.push(width + "x" + height);

  // check support for webp
  if (accept.includes(variables.webpExtension)) {
    url.push(variables.webpExtension);
  } else {
    url.push(extension);
  }
  url.push(imageName + "." + extension);

  fwdUri = url.join("/");

  // final modified url is of format /images/200x200/webp/image.jpg
  request.uri = fwdUri;
  callback(null, request);
};