const fetch = require('node-fetch');
const readline = require('readline');

let running = true;
let paused = false;
let timeout = 1000;

function speedUp() {
  if (timeout >= 2) {
    console.log("Speeding up");
    timeout /= 2;
  }
}

function slowDown() {
  if (timeout <= 4000) {
    console.log("Slowing down");
    timeout *= 2;
  }
}

function togglePause() {
  paused = !paused
  paused ? console.log("Stopping") : console.log("Resuming");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl._writeToOutput = function () { };

rl.input.on('keypress', (str, key) => {
  if (key && key.name === 'q') {
    rl.close();
  } else if (key && str === '+') {
    speedUp();
  } else if (key && str === '-') {
    slowDown();
  } else if (key && key.name === 'space') {
    togglePause();
  }
});

// Enable listening for key press events
// rl.input.setRawMode(true); // does not wait for 'Enter' to be pressed
// rl.input.resume(); // start listening for events

// Handle closing of the readline interface
rl.on('close', () => {
  console.log('Exiting Program.');
  process.exit(0);
});

async function handleText(text) {
  console.log("--- Reading Text ---");
  const lines = text.split(/\r?\n/);
  let line = 0
  while (running) {
    if (line === lines.length) break;
    if (!paused) {
      console.log(`Line ${line + 1}: ${lines[line]}\n`);
      line++;
    }
    await new Promise(resolve => setTimeout(resolve, timeout));
  }
  console.log("--- End Of Text ---");
  process.exit(0);
}

async function handleBytes(buffer) {
  console.log("--- Reading Bytes ---");
  let start = 0
  let end = 15
  while (running) {
    if (start >= buffer.byteLength) break;
    if (!paused) {
      const slicedBuffer = buffer.slice(start, end + 1);
      const hexStringWithSpaces = Array.from(slicedBuffer, byte => byte.toString(16).padStart(2, '0')).join(' ');
      console.log(`0x${start.toString(16)}: ${hexStringWithSpaces}\n`)
      start += 16
      end += 16
    }
    await new Promise(resolve => setTimeout(resolve, timeout));
  }
  console.log("--- End Of Bytes ---");
  process.exit(0);
}

function checkUrl() {
  if (process.argv.length < 3) {
    console.log('A url is required, but was not provided.\n')
    return false;
  }
  console.log(process.argv[2]);
  return process.argv[2];
}

async function main() {
  const url = checkUrl();
  if (!url) process.exit(0);

  console.log("Press Ctrl+C or q to quit at anytime.\n");

  try {
    console.log(`Retrieving resource from ${url}\n`);
    // const response = await fetch(url);
    // const response = await fetch('http://localhost:3001');
    // const response = await fetch('http://localhost:3001/assets/js/index.js');
    // const response = await fetch('http://localhost:3001/assets/css/styles.css');
    // const response = await fetch('http://localhost:3001/files/text_file.txt');
    // const response = await fetch('http://localhost:3001/files/picture_png.png');
    const response = await fetch('http://localhost:3001/files/picture_jpg.jpg');
    // const response = await fetch('http://localhost:3001/files/sprites.zip');
    // const response = await fetch('http://localhost:3001/files/sample.doc');
    // const response = await fetch('http://localhost:3001/files/firefox.exe');
    const contentType = response.headers.get('content-type');
    // console.log('Content-Type:', contentType);

    const charType = contentType.split(';');

    if (charType.length > 1) {
      if (charType[1].trim().split('=')[1].toLowerCase() == 'utf-8') {
        const textBody = await response.text();
        handleText(textBody);
        return;
      }
    }
    if (charType[0].split('/')[0] == 'text') {
      const textBody = await response.text();
      console.log('Text Body:');
      handleText(textBody);
    } else {
      const buffer = await response.buffer();
      handleBytes(buffer);
    }

  } catch (error) {
    console.log(error);
    console.log('Make sure the provided url is valid.')
  }

}

main();
