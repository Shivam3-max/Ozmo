// Local SMTP sink for the regression suite: accepts every message and appends it,
// one JSON line each, to $SMTP_LOG (default ./smtp.log). Never use outside testing.
import net from "node:net";
import fs from "node:fs";

const LOG = process.env.SMTP_LOG ?? "smtp.log";
net.createServer((sock) => {
  let data = false, buf = "", msg = "", rcpt = [];
  const say = (s) => sock.write(s + "\r\n");
  say("220 sink ready");
  sock.on("data", (chunk) => {
    buf += chunk.toString("utf8");
    let i;
    while ((i = buf.indexOf("\r\n")) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 2);
      if (data) {
        if (line === ".") {
          data = false;
          fs.appendFileSync(LOG, JSON.stringify({ to: rcpt, raw: msg }) + "\n");
          msg = ""; rcpt = [];
          say("250 queued");
        } else msg += line + "\n";
        continue;
      }
      const cmd = line.slice(0, 4).toUpperCase();
      if (cmd === "EHLO" || cmd === "HELO") say("250 sink");
      else if (cmd === "MAIL") say("250 ok");
      else if (cmd === "RCPT") { rcpt.push(line.replace(/^RCPT TO:\s*/i, "")); say("250 ok"); }
      else if (cmd === "DATA") { data = true; say("354 go"); }
      else if (cmd === "QUIT") { say("221 bye"); sock.end(); }
      else say("250 ok");
    }
  });
  sock.on("error", () => {});
}).listen(2525, "127.0.0.1", () => console.log("smtp sink on 2525"));
