const fs = require('fs');
const bytes = fs.readFileSync(__dirname + '/loop.wasm');
const n = process.argv[2] == null ? 1 : parseInt(process.argv[2]); // we will loop n times

let loop_test = null;

let importObject = {
  env: {
    log: function (n, factorial) { // log n factorial to output tag
      console.log(`${n}! = ${factorial}`);
    },
  }
};


(async () => {
  let obj = await WebAssembly.instantiate(new Uint8Array(bytes),
    importObject);

  loop_test = obj.instance.exports.loop_test;
  const factorial = loop_test(n); // call our loop test
  console.log(`result ${n}! = ${factorial}`);
})();