const fetch = require('node-fetch');
const readline = require('readline');


let running = true;
let paused = false;


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.input.on('keypress', (str, key) => {
  if (key && key.ctrl && key.name === 'c') {
    console.log('Ctrl+C pressed. Exiting...');
    rl.close();
  } else {
    console.log('Key pressed:', str, key);
    if (key && key.name === 'q') {
      rl.close();
    } else if (key && str === '+') {
      console.log("Speeding up");
    } else if (key && str === '-') {
      console.log("Slowing down");
    } else if (key && key.name === 'space') {
      paused = !paused
      paused ? console.log("Stopping") : console.log("Resuming");;
    }
  }
});

// Enable listening for key press events
rl.input.setRawMode(true); // does not wait for 'Enter' to be pressed
rl.input.resume(); // start listening for events

// Handle closing of the readline interface
rl.on('close', () => {
  console.log('Exiting Program.');
  process.exit(0);
});

function handleText(text) {

}

function handleBytes(buffer) {

}

function checkUrl() {
  if (process.argv.length < 3) {
    console.log('A url is required, but was not provided.')
    return false;
  }
  console.log(process.argv[2]);
  return process.argv[2];
}

async function main() {
  const url = checkUrl();
  // if (!url) return;

  console.log("Press Ctrl+C or q to quit at anytime.");

  try {
    console.log(`Retrieving resource from ${url}`);
    // const response = await fetch('http://localhost:3001');
    // const response = await fetch('http://localhost:3001/assets/js/index.js');
    // const response = await fetch('http://localhost:3001/assets/css/styles.css');
    // const response = await fetch('http://localhost:3001/files/text_file.txt');
    // const response = await fetch('http://localhost:3001/files/picture_png.png');
    // const response = await fetch('http://localhost:3001/files/picture_jpg.jpg');
    // const response = await fetch('http://localhost:3001/files/sprites.zip');
    // const response = await fetch('http://localhost:3001/files/sample.doc');
    const response = await fetch('http://localhost:3001/files/firefox.exe');
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);

    const charType = contentType.split(';');

    if (charType.length > 1) {
      if (charType[1].trim().split('=')[1].toLowerCase() == 'utf-8') {
        const textBody = await response.text();
        console.log('Text Body:\n', textBody);
        handleText();
        return;
      }
    }
    if (charType[0].split('/')[0] == 'text') {
      const textBody = await response.text();
      console.log('Text Body:\n', textBody);
      handleText(textBody);
    } else {

      // const stream = response.body;
      // stream.pipe(process.stdout);

      const buffer = await response.buffer();
      console.log('Response Body as Buffer:\n', buffer);
      handleBytes(buffer);
    }

    while (running) {
      console.log('in while loop');
      if (!paused) {
        console.log('doing work');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.log(error);
    console.log('Make sure the provided url is valid.')
  }

}


main();
