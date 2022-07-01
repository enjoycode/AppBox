# Build C# Language Native

```shell
cd tree-sitter-c-sharp
clang -fPIC -shared -o ~/Desktop/tree-sitter-c-sharp.dylib src/parser.c src/scanner.c -Isrc -O2
```

# Generate C# Language WASM

https://github.com/tree-sitter/tree-sitter/tree/master/lib/binding_web

The following example shows how to generate .wasm file for tree-sitter JavaScript grammar.

IMPORTANT: emscripten or docker need to be installed.

First install tree-sitter-cli and the tree-sitter language for which to generate .wasm (tree-sitter-c-sharp in this example):

```shell
npm install --save-dev tree-sitter-cli tree-sitter-c-sharp
```

Then just use tree-sitter cli tool to generate the .wasm.

```shell
npx tree-sitter build-wasm node_modules/tree-sitter-c-sharp
```