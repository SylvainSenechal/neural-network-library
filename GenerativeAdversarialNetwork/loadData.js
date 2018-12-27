const fs = require('fs')


let dataFileBuffer  = fs.readFileSync(__dirname + '/images.idx3-ubyte');
let labelFileBuffer = fs.readFileSync(__dirname + '/labels.idx1-ubyte');
let pixelValues     = [];

for (let image = 0; image <= 5000; image++) {
  let pixels = [];

  for (let y = 0; y <= 27; y++) {
    for (let x = 0; x <= 27; x++) {
      pixels.push(dataFileBuffer[(image * 28 * 28) + (x + (y * 28)) + 16]);
    }
  }

  pixelValues.push({label: labelFileBuffer[image + 8], img: pixels});
}


fs.writeFileSync("data.json", JSON.stringify(pixelValues), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

// let read  = fs.readFileSync(__dirname + '/data.json');
// console.log(JSON.parse(read)[0].label)
