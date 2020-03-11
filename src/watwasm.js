const version = "1.0.1";
function log_usage() {
  const chalk = require('chalk');
  console.log(`
  Usage:
  ${chalk.yellow('watwasm file.wat')}
  Creates file.wasm given a WebAssembly Text file

  ${chalk.yellow('watwasm file.wasm -o watfile.wat')}
  Creates a watfile.wat WebAssembly Text file.
    The -o flag allows you to specify an output file.

  Flags:
  ${chalk.yellow('-nd --no-debug-names')} Do not include debug names in WAT
  ${chalk.yellow('-ie --inline-exports')} Write imports inline
  ${chalk.yellow('-o')} is followed by an output file name`);

  log_support();
}


function log_warning(warning_string) {
  const chalk = require('chalk');
  console.log(chalk.yellow(`
    ===================================================
    WARNING: ${warning_string}
    ===================================================
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

function watwasm(args) {
  if (args.length <= 2) {
    log_usage();
    return;
  }

  var glob_map = {};
  var glob_index = 0;
  var func_map = {};
  var func_index = 0;
  var block_map = {};
  var block_index = 0;

  let inline_exports = false;
  let debug = true;

  const wabt = require("wabt")();
  var binaryen = require("binaryen");
  const fs = require('fs');

  let file = args[2];
  let out_file;
  let wat_in = false;

  if (file.endsWith('.wasm')) {
    out_file = file;
  }
  else if (file.endsWith('.wat')) {
    out_file = file.replace('.wat', '.wasm');
    wat_in = true;
  }
  else {
    return;
  }

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


  var bytes = fs.readFileSync(file);
  var binary_module
  if (wat_in === true) {
    let wat_string = bytes.toString();

    if (warn = wat_string.match(/get_local|get_global|set_local|set_global/)) {
      if (warn[0] === "get_local") {
        log_warning("get_local should be replaced by local.get")
      }
      else if (warn[0] === "set_local") {
        log_warning("set_local should be replaced by local.set")
      }
      else if (warn[0] === "set_global") {
        log_warning("set_global should be replaced by global.set")
      }
      else if (warn[0] === "get_global") {
        log_warning("get_global should be replaced by global.set")
      }
    }

    let $global_i = 0;
    wat_string = wat_string
      .replace(/\(\;.*?\;\)/, '')
      .replace(/get_local/g, 'local.get')
      .replace(/get_global/g, 'global.get')
      .replace(/set_local/g, 'local.set')
      .replace(/set_global/g, 'global.set');

    wat_string = wat_string.split('\n').map((line) => {
      if (line.match(/loop\s+\$/)) {
        line = line.replace(/loop\s+\$[a-zA-Z0-9_]+/, (s) => {
          s = s.replace(/loop\s+/, '');
          block_map[s] = block_index;
          return 'loop (;' + s + ' ' + block_index++ + ';) ';
        });
      }
      if (line.match(/block\s+\$/)) {
        line = line.replace(/block\s+\$[a-zA-Z0-9_]+/, (s) => {
          s = s.replace(/block\s+/, '');
          block_map[s] = block_index;
          return 'block (;' + s + ' ' + block_index++ + ';) ';
        });
      }
      if (line.match(/.*?br\s+\$[a-zA-Z0-9_]+/)) {
        line = line.replace(/\$[a-zA-Z0-9_]+/, (s) => {
          return block_map[s] + '(;' + s + ';) ';
        });
      }
      if (line.match(/.*?br_if\s+\$[a-zA-Z0-9_]+/)) {
        line = line.replace(/\$[a-zA-Z0-9_]+/, (s) => {
          return block_map[s] + '(;' + s + ';) ';
        });
      }
      if (line.match(/\(global\s+\$/)) {
        line = line.replace(/\$[a-zA-Z0-9_]+/, (s) => {
          glob_map[s] = glob_index;
          return '(;' + s + ' ' + glob_index++ + ';) ';
        });
      }
      if (line.match(/\(func\s+\$/)) {
        block_index = 0;
        line = line.replace(/\$[a-zA-Z0-9_]+/, (s) => {
          func_map[s] = func_index;
          return '(;' + s + ' ' + func_index++ + ';) ';
        });
      }
      if (line.match(/\(func/)) {
        block_index = 0;
      }
      if (line.match(/.*?call\s+\$[a-zA-Z0-9_]+/)) {
        line = line.replace(/\$[a-zA-Z0-9_]+/, (s) => {
          return func_map[s] + '(;' + s + ';) ';
        });
      }
      if (line.match(/.*?global\.get\s+\$[a-zA-Z0-9_]+/)) {
        line = line.replace(/global\.get\s+\$[a-zA-Z0-9_]+/, (s) => {
          s = s.replace(/global\.get\s+/, '');
          return 'global.get ' + glob_map[s] + '(;' + s + ';) ';
        });
      }
      if (line.match(/.*?global\.set\s+\$[a-zA-Z0-9_]+/)) {
        line = line.replace(/global\.set\s+\$[a-zA-Z0-9_]+/, (s) => {
          s = s.replace(/global\.set\s+/, '');
          return 'global.set ' + glob_map[s] + '(;' + s + ';) ';
        });
      }
      return line;
    }).join('\n');
    console.log("a");
    const wasmModule = wabt.parseWat(wat_string, wat_string);
    console.log("b");
    wasmModule.validate();
    console.log("c");

    let wast = wasmModule.toText({ foldExprs: true, inlineExport: inline_exports });
    console.log("d");
    console.log(wast);
    try {
      binary_module = binaryen.parseText(wast);
    }
    catch (e) {
      console.log("fail=" + e)
    }
    console.log("e");
  }
  else {
    binary_module = binaryen.readBinary(bytes);
  }

  var map_file;

  if (debug === true) {
    map_file = out_file.replace('.wasm', '.map');
  }
  else {
    for (var i = 2; i < args.length; i++) {
      if (args[i].startsWith("-O")) {
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
    binary_module.optimize();
  }

  var out_binary;
  if (debug === true) {
    console.log('debug');
    let bin_source_map = binary_module.emitBinary(map_file);
    out_binary = bin_source_map.binary;
    let source_map = bin_source_map.source_map;

    fs.writeFile(map_file, source_map, function (err, file) {
      if (err) throw err;
      console.log('Sourcemap Saved!');
    });
  }
  else {
    out_binary = binary_module.emitBinary();
  }

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
      log_support();
    });
  }
  else {
    fs.writeFile(out_file, out_binary, function (err, file) {
      if (err) throw err;
      console.log('WASM File Saved!');
      log_support();
    });
  }

}

module.exports = { watwasm };