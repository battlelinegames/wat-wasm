# wat-wasm
wat-wasm is a tool for converting WebAssembly Text to binary WebAssembly.  It includes optimization flags, and can also convert binary WebAssembly back to WebAssembly Text format.

## Install:
`npm install wat-wasm -g`

## Usage:
    wat-wasm file.wat
    Creates a WASM file given a wat file
    
    wat-wasm file.wat -o watfile.wasm
    Creates a WASM file given a WebAssembly Text file.
    The -o flag allows you to specify an output file.

    wat-wasm file.wasm -o watfile.wat
    Creates a watfile.wat WebAssembly Text file.
    The -o flag allows you to specify an output file.

    watwasm file.wat
    Creates a WASM file given a wat file
    
    watwasm file.wat -o watfile.wasm
    Creates a WASM file given a WebAssembly Text file.
    The -o flag allows you to specify an output file.

    watwasm file.wasm -o watfile.wat
    Creates a watfile.wat WebAssembly Text file.
    The -o flag allows you to specify an output file.

    wat2wasm file.wat
    wat2wasm does the same thing as watwasm, but
    the input file must be WAT

    wasm2wat file.wasm
    wasm2wat does the same thing as watwasm, but
    the input file must be WASM

## Flags:
    -o is followed by an output file name

    -O1 minimal performance optmization
    -O2 moderate performance optmization
    -O3 maximum performance optmization

    -Os minimal size optmization
    -Oz maximum size optmization


### For help please contact:
    Rick Battagline
    rick@battagline.com
    Twitter: @battagline
    
[Rick's WebAssembly Playground](https://embed.com/wasm/) |
[WebAssembly Game Development Book](http://wasmbook.com)