const fs = require('fs');

//write hello world to file
fileWrite();

//sleep forever to keep the process alive
setInterval(fileWrite, 1000);

function fileWrite() {
  fs.writeFile('/mnt/data/test.txt', 'Hello World!' + new Date().getTime(), function (err) {
    if (err)
      throw err;
    console.log('Saved!');
  });
}
