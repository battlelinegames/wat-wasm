const { IfId } = require('binaryen');

function log_error(error_string) {
  const chalk = require('chalk');
  console.log(chalk.red.bold(`
    ===================================================================================
    ERROR: ${error_string}
    ===================================================================================
  `));
}

function log_support() {
  const chalk = require('chalk');
  console.log(chalk.gray(
    `
  Need help?  
  Contact Rick Battagline
  Twitter: @battagline
  https://embed.com/wasm
  `));

}

function strip_comments(wat_string) {
  wat_string.replace(/\(;.*?;\)/, '');

  wat_string = wat_string.split('\n').map((line) => {
    line = line.replace(/;;.*/, '');
    return line;
  }).join('\n');
  return wat_string;
}

function max_mem_check(wat_string) {
  const mem_regex = /(?:\(memory.*?)((?:\d|_)+)/;
  let match_arr = wat_string.match(mem_regex);

  if (match_arr.length > 1) {
    let num_str = match_arr[1];
    num_str = num_str.replace('_', '');
    let num = parseInt(num_str);
    if (num > 32_767) {
      log_error(`ATTEMPT TO ALLOCATE ${num} PAGES OF MEMORY GREATER THAN MAXIMUM OF 32767`);
      return true;
    }
  }
  return false;
}

function watwasm(args) {

  var glob_map = {};
  var glob_index = 0;
  var func_map = {};
  var func_index = 0;
  var block_map = {};
  var block_index = 0;

  //  let inline_exports = false;
  //  let debug = true;

  const wabt = require("wabt")();
  var binaryen = require("binaryen");
  const fs = require('fs');

  let file = args[2];
  const usage_name = process.argv[1];

  let out_file;
  let wat_in = false;

  if (file.endsWith('.wasm')) {
    out_file = file;
  }
  if (file.endsWith('.wat')) {
    out_file = file.replace('.wat', '.wasm');
    console.log(`outfile=${out_file}`);
    wat_in = true;
  }
  else {
    log_error(`${file} HAS UNKNOWN FILE TYPE`);
    return;
  }
  /*
  for (var i = 2; i < args.length; i++) {
    if (args[i] === "-d") {
      debug = true;
      break;
    }
    if (args[i] === "--inline-exports" || args[i] === "-ie") {
      inline_exports = true;
      continue;
    }
  }
  */
  try {
    var bytes = fs.readFileSync(file);
  }
  catch (e) {
    log_error(`CAN NOT OPEN ${file}`);
    return;
  }

  var binary_module
  if (wat_in === true) {
    let wat_string = bytes.toString();
    wat_string = strip_comments(wat_string);
    if (max_mem_check(wat_string)) {
      return;
    }

    console.log(wat_string);
    return;

    let $global_i = 0;
    wat_string = wat_string
      .replace(/\(\;.*?\;\)/, '')
      .replace(/local\.get/g, 'get_local')
      .replace(/global\.get/g, 'get_global')
      .replace(/local\.set/g, 'set_local')
      .replace(/global\.set/g, 'set_global');

    console.log(`
    ===============================================================    
    `);

    console.log(wat_string);
    const wasmModule = wabt.parseWat(wat_string, wat_string);

    wasmModule.resolveNames();
    wasmModule.validate();

    // error if relocatable is set to true
    const binary_buffer = wasmModule.toBinary({
      log: false, canonicalize_lebs: false,
      relocatable: false, write_debug_names: false
    }).buffer;
    binary_module = binaryen.readBinary(binary_buffer);

  }
  else {
    binary_module = binaryen.readBinary(bytes);
  }

  var map_file;
  var opt = false;

  for (var i = 2; i < args.length; i++) {
    if (args[i].startsWith("-O")) {
      opt = true;
      let optimize = args[i];
      binaryen.setShrinkLevel(0);
      if (optimize === "-Oz") {
        console.log('Maximum Size Optimization');
        binaryen.setShrinkLevel(2);
      }
      else if (optimize === "-Os") {
        console.log('Standard Size Optimization');
        binaryen.setShrinkLevel(1);
      }
      else if (optimize === "-O3") {
        console.log('Maximum Performance Optimization');
        binaryen.setOptimizeLevel(3);
      }
      else if (optimize === "-O2") {
        console.log('Medium Performance Optimization');
        binaryen.setOptimizeLevel(2);
      }
      else if (optimize === "-O1") {
        console.log('Minimum Performance Optimization');
        binaryen.setOptimizeLevel(1);
      }
      break;
    }
  }

  if (opt) {
    binary_module.optimize();
  }

  var out_binary = binary_module.emitBinary();

  for (var i = 2; i < args.length - 1; i++) {
    if (args[i] === "-o") {
      out_file = args[i + 1];
      break;
    }
  }
  console.log(`Writing to ${out_file}`);

  if (out_file.match('.wat')) {
    let wat_string = binary_module.emitText();
    fs.writeFile(out_file, wat_string, function (err, file) {
      if (err) throw err;
      console.log('WAT File Saved!');
    });
  }
  else {
    fs.writeFile(out_file, out_binary, function (err, file) {
      if (err) throw err;
      console.log('WASM File Saved!');
    });
  }

}

module.exports = { watwasm, log_error, log_support };