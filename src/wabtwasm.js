function wabtwasm(args) {
  console.log(`
========================================================
  WAT-WASM
========================================================
  `);

  var glob_map = {};
  var glob_index = 0;
  var func_map = {};
  var func_index = 0;
  var block_map = {};
  var block_index = 0;

  let inline_exports = false;
  let debug = true;

  const wabt = require("../lib/wabt");
  var binaryen = require("binaryen");

  const fs = require('fs');

  let file = args[2];
  const usage_name = process.argv[1];

  let out_file = file.replace('.wat', '.wasm');
  //console.log(`outfile=${out_file}`);
  wat_in = true;

  var bytes = fs.readFileSync(file);

  let wat_string = bytes.toString();

  //console.log(wat_string);

  wat_string = wat_string
    .replace(/\(\;.*?\;\)/, '')
    .replace(/local\.get/g, 'get_local')
    .replace(/global\.get/g, 'get_global')
    .replace(/local\.set/g, 'set_local')
    .replace(/global\.set/g, 'set_global');


  console.log("parse wat");
  const wasmModule = wabt.parseWat(wat_string, wat_string);

  console.log("resolveNames");
  wasmModule.resolveNames();

  console.log("validate");
  wasmModule.validate();
  console.log("to binary");
  const binary_buffer = wasmModule.toBinary({
    log: false, canonicalize_lebs: true,
    relocatable: true, write_debug_names: true
  }).buffer;
  console.log("binary module");
  binary_module = binaryen.readBinary(binary_buffer);
  console.log("optimize");

  binary_module.optimize();

  var out_binary = binary_module.emitBinary();
  fs.writeFile(out_file, out_binary, function (err, file) {
    if (err) throw err;
    console.log('WASM File Saved!');
  });
  console.log("GO WABT!");
}

module.exports = { wabtwasm };