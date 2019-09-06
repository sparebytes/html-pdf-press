import * as os from "os";
import * as path from "path";
const delim = /^win/.test(os.platform()) ? ";" : ":";
process.env["NODE_CONFIG_DIR"] = [path.join(__dirname, "config"), process.cwd()].join(delim);
// tslint:disable-next-line: no-var-requires
require("./main");
