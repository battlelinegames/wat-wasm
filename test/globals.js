const fs = require('fs'); // node.js file system module

const bytes = fs.readFileSync(__dirname + '/globals.wasm');

let global_test = null;
let log_message = (message_num, value) => {
  let message = "unknown: ";
  if (message_num === 0) {
    message = "i32: ";
  }
  else if (message_num === 1) {
    message = "i64: ";
  }
  else if (message_num === 2) {
    message = "f32: ";
  }
  else if (message_num === 3) {
    message = "f64: ";
  }
  console.log(message + value);
};

let importObject = {
  env: {
    log_i32: log_message,
    log_f32: log_message,
    log_f64: log_message,
    import_i32: 5_000_000_000, // _ is ignored in numbers in JS and WAT
    import_f32: 123.0123456789,
    import_f64: 123.0123456789,
  }
};

(async () => {
  let obj = await WebAssembly.instantiate(new Uint8Array(bytes),
    importObject);
  ({ globaltest: global_test } = obj.instance.exports);

  global_test();
})();