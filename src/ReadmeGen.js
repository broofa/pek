const assert = require('assert');
const fs = require('fs');
const util = require('util');

const ReadmeGen = {
  _buffer: [],
  _dumps: [],
  log: function(...args) {
    const line = args.map(util.inspect).join(' ');
    ReadmeGen._buffer.push(line);
  },

  dump: function() {
    ReadmeGen._dumps.push(ReadmeGen._buffer);
    ReadmeGen._buffer = [];
  },

  compile: function(input, output) {
    const source = fs.readFileSync(input, 'utf8');
    const lines = [];

    let started = false;
    let indoc = false, ldoc = true;
    source.split('\n').forEach((line, i) => {
      started = started && !/ReadmeGen.compile/.test(line);
      if (!started) {
        started = /\/\/\s*START/.test(line);
        return;
      }

      if (/^\s*`\)\s*$/.test(line)) {
        assert(indoc, `Line ${i+1}: Unbalanced doc literal`);
        indoc = false;
      } else if (/^\s*\(`\s*$/.test(line)) {
        assert(!indoc, `Line ${i+1}: Unexpecte doc literal`);
        indoc = true;
      } else if (/^\s*ReadmeGen.dump()/.test(line)) {
        let out = ReadmeGen._dumps.shift() || [];;
				if (out.length) {
					lines.push(out.map(l => '\u22d6 ' + l).join('\n'));
				} else {
					lines.push('\u00ab nothing logged \u00bb');
				}
      } else {
        if (indoc != ldoc) lines.push(!indoc ? '```javascript' : '```')

        if (indoc) {
          // Raw GFM doc

					// Macron-ize the 'e' in Pek
					if (!/`.*Pek.*`/.test(line)) line = line.replace(/Pek/g, 'P&emacr;k');
          lines.push(line.replace(/\\`/g, '`'));
        } else {
          // Source
          lines.push(line.replace(/ReadmeGen.log/g, 'console.log'));
        }

        ldoc = indoc;
      }

    });
    if (!indoc) lines.push('```');
    fs.writeFileSync(output, lines.join('\n'), 'utf8');
  }
};

module.exports = ReadmeGen;
