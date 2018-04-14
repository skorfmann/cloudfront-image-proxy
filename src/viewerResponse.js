const handler = (event, context, callback) => {
  let response = event.Records[0].cf.response;
  console.log("viewer response", response);
  callback(null, response);
};

export { handler };
