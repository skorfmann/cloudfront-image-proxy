const handler = (event, context, callback) => {
  let request = event.Records[0].cf.request;
  console.log("origin request", request);
  callback(null, request);
};

export { handler }