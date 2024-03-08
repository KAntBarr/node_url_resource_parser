const fetch = require('node-fetch');


function checkUrl() {
  if(process.argv.length < 3) {
    console.log('A url is required, but was not provided.')
    return false;
  }
  console.log(process.argv[2]);
  return process.argv[2];
}

async function main() {
  const url = checkUrl();
  // if (!url) return;

  try {
    console.log(`Retrieving resource from ${url}`);
    const response = await fetch('http://youtube.com');
    console.log(response);
  } catch (error) {
    console.log(error);
    console.log('Make sure the provided url is valid.')
  }

}


main();
