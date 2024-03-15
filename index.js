const fetch = require('node-fetch');
const readline = require('readline');

let paused = false; // toggle between executing and stopping the program
let timeout = 1000; // 1000 ms is 1 second

// speed up the program by decreasing the timeout
function speedUp() {
  if (timeout >= 2) {
    console.log("Speeding up");
    timeout /= 2;
  }
}

// slow down the program by increasing the timeout
function slowDown() {
  if (timeout <= 4000) {
    console.log("Slowing down");
    timeout *= 2;
  }
}

// run if paused, pause if running
function togglePause() {
  paused = !paused
  paused ? console.log("Stopping") : console.log("Resuming");
}

// set up to read user input/keyboard events
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl._writeToOutput = function () { }; // needed to prevent output of keyboard events

// when a key press is detected,
// determine the key and call
// the revelant function
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

// when the file type is determined to be text
// handle the text here by printing each line
// by the default timeout
async function handleText(text) {
  console.log("--- Reading Text ---");
  const lines = text.split(/\r?\n/); // split the string by either '\n' or '\r\n'
  let line = 0; // the current line
  while (1) {
    if (line === lines.length) break; // leave the loop if end of file is reached
    // if running, print the current line
    if (!paused) {
      console.log(`Line ${line + 1}: ${lines[line]}\n`);
      line++; // increment current line
    }
    // using Promise and setTimeout to implement a timer
    await new Promise(resolve => setTimeout(resolve, timeout));
  }
  console.log("--- End Of Text ---");
  process.exit(0);
}

// when the file type is determined to be not text
// handle the bytes here by printing every 16 bytes
// by the default timeout
async function handleBytes(buffer) {
  console.log("--- Reading Bytes ---");
  let start = 0 // the start of the bytes to read
  let end = 15 // the end of the bytes to read
  while (1) {
     // when start reaches the end of the bytes, break out of the loop
    if (start >= buffer.byteLength) break;
    // if running print the next 16 bytes
    if (!paused) {
      const slicedBuffer = buffer.slice(start, end + 1); // get the 16 bytes
      const hexStringWithSpaces = Array.from(slicedBuffer, byte => byte.toString(16).padStart(2, '0')).join(' '); // add spaces in between those bytes
      console.log(`0x${start.toString(16)}: ${hexStringWithSpaces}\n`) // print formatted bytes
      start += 16 // increment start by 16
      end += 16 // increment end by 16
    }
    // using Promise and setTimeout to implement a timer
    await new Promise(resolve => setTimeout(resolve, timeout));
  }
  console.log("--- End Of Bytes ---");
  process.exit(0);
}

// check to make sure that a second 
// argument was provided, it could
// still be an invalid url
function checkUrl() {
  // node . http://example.com
  if (process.argv.length < 3) {
    console.log('A url is required, but was not provided.\n')
    return false;
  }
  console.log(process.argv[2]);
  return process.argv[2];
}

async function main() {
  const url = checkUrl(); // check for url
  if (!url) process.exit(0);

  console.log("Press Ctrl+C or q to quit at anytime.\n");

  try {
    console.log(`Retrieving resource from ${url}\n`);
    const response = await fetch(url); // fetch the url
    // const response = await fetch('http://localhost:3001');
    // const response = await fetch('http://localhost:3001/assets/js/index.js');
    // const response = await fetch('http://localhost:3001/assets/css/styles.css');
    // const response = await fetch('http://localhost:3001/files/text_file.txt');
    // const response = await fetch('http://localhost:3001/files/picture_png.png');
    // const response = await fetch('http://localhost:3001/files/picture_jpg.jpg');
    // const response = await fetch('http://localhost:3001/files/sprites.zip');
    // const response = await fetch('http://localhost:3001/files/sample.doc');
    // const response = await fetch('http://localhost:3001/files/firefox.exe');

    const contentType = response.headers.get('content-type'); // get the 'Content-Type'

    const charType = contentType.split(';');

    // check to see if charset was provided
    if (charType.length > 1) {
      // if utf-8 then handle the response data as text
      if (charType[1].trim().split('=')[1].toLowerCase() == 'utf-8') {
        const textBody = await response.text();
        handleText(textBody);
        return;
      }
    }
    // if content type is text then handle the response data as text
    if (charType[0].split('/')[0] == 'text') {
      const textBody = await response.text();
      console.log('Text Body:');
      handleText(textBody);
    } else { // else handle as bytes
      const buffer = await response.buffer();
      handleBytes(buffer);
    }

  } catch (error) {
    console.log(error);
    console.log('Make sure the provided url is valid.');
    process.exit(0);
  }

}

main();
