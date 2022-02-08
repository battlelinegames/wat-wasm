const { IfId } = require('binaryen');
const chalk = require('chalk');
const fs = require('fs');

function log_error(error_string) {
  console.log(chalk.red(`
    ===================================================================================
    ERROR: ${error_string}
    ===================================================================================
  `));
}

function log_support() {
  console.log(
    chalk.gray(
      `
  Need help?  
  Contact Rick Battagline
  Twitter: @battagline
  https://wasmbook.com
  v1.0.43
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

  if (match_arr == null) {
    console.log("no memory");
    return false;
  }
  console.log("memory found");

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

function includeFiles(wat_string) {
  let line;
  while (line = wat_string.match(/\(#include\s+\"(.*?)\"\)/)) {
    let file_name = line[0].replace(/\(#include\s+\"(.*?)\"\)/, '$1');
    console.log(`
    file_name:${file_name}$
    `);
    let file_contents = fs.readFileSync(file_name);
    wat_string = wat_string.replace(/\(#include\s+\"(.*?)\"\)/, file_contents);
  }

  return wat_string;

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

  //const wabt = require("wabt")();
  require("wabt")().then(wabt => {
    var binaryen = require("binaryen");

    let file = args[2];
    const usage_name = process.argv[1];

    let out_file;
    let wat_in = false;

    if (file != null && file.endsWith('.wasm')) {
      out_file = file;
    }
    else if (file != null && file.endsWith('.wat')) {
      out_file = file.replace('.wat', '.wasm');
      //console.log(`outfile=${out_file}`);
      wat_in = true;
    }
    else {
      log_error(`${file} HAS UNKNOWN FILE TYPE`);
      return;
    }

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
      wat_string = includeFiles(wat_string);

      if (max_mem_check(wat_string)) {
        return;
      }

      //console.log(wat_string.substring(0, 1_000) + '...');

      let $global_i = 0;
      wat_string = wat_string
        .replace(/\(\;.*?\;\)/, '')
        .replace(/local\.get/g, 'get_local')
        .replace(/global\.get/g, 'get_global')
        .replace(/local\.set/g, 'set_local')
        .replace(/global\.set/g, 'set_global');
      /*
      console.log(`
      ===============================================================    
      `);
      */
      //console.log(wat_string.substring(0, 1_000) + '...');
      wabt_options = {
        exceptions: false,
        mutable_globals: false,
        sat_float_to_int: false,
        sign_extension: false,
        simd: false,
        threads: false,
        multi_value: false,
        tail_call: false,
        bulk_memory: false,
        reference_types: false,
        annotations: false,
        gc: false
      };

      for (var i = 2; i < args.length; i++) {
        if (args[i] == "--exceptions") {
          wabt_options.exceptions = true;
        }
        else if (args[i] == "--mutable-globals") {
          wabt_options.mutable_globals = true;
        }
        else if (args[i] == "--sat-float-to-int") {
          wabt_options.sat_float_to_int = true;
        }
        else if (args[i] == "--sign-extension") {
          wabt_options.sign_extension = true;
        }
        else if (args[i] == "--simd") {
          wabt_options.simd = true;
        }
        else if (args[i] == "--threads") {
          wabt_options.threads = true;
        }
        else if (args[i] == "--multi-value") {
          wabt_options.multi_value = true;
        }
        else if (args[i] == "--tail-call") {
          wabt_options.tail_call = true;
        }
        else if (args[i] == "--bulk-memory") {
          wabt_options.bulk_memory = true;
        }
        else if (args[i] == "--reference-types") {
          wabt_options.reference_types = true;
        }
        else if (args[i] == "--annotations") {
          wabt_options.annotations = true;
        }
        else if (args[i] == "--gc") {
          wabt_options.gc = true;
        }
      }
      const wasmModule = wabt.parseWat(wat_string, wat_string, wabt_options);

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
  });
}

module.exports = { watwasm, log_error, log_support };