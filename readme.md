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

## Flags:
    -nd --no-debug-names Do not include debug names in WAT
    -ie --inline-exports Write imports inline
    -o is followed by an output file name

### For help please contact:
    Rick Battagline
    rick@battagline.com
    Twitter: @battagline
    
[Rick's WebAssembly Playground](https://embed.com/wasm/) |
[WebAssembly Game Development Book](http://wasmbook.com)
