import { plugin, type BunPlugin } from "bun";
import { dlopen, FFIType, suffix } from "bun:ffi";

const myPlugin: BunPlugin = {
  name: "RustPlugin",
  setup(build) {

    build.onLoad({
      filter: /\.rs$/,
    }, (args) => {
      Bun.spawnSync(["rustc", "--crate-type=cdylib", args.path], {
        env: process.env
      });

      // get rust file name
      const filename = args.path.split("/").pop()!.split(".")[0]

      const path = `lib${filename}.${suffix}`
      const lib = dlopen(path, {
        add: {
          args: [FFIType.i32, FFIType.i32],
          returns: FFIType.i32,
        }
      });

      return {
        exports: lib.symbols,
        loader: 'object',
      }
    })
  },
};

plugin(myPlugin);