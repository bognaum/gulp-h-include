/**
 * @@f@@ - file pathname
 * @@l@@ - line number
 * @@F@@ - pathname of the file that including this file
 * @@L@@ - a line number of the file that including this file
 * @@+ "/foo/bar.html"  - include with path from base
 * @@+ "./foo/bar.html" - include with path from including file
 * @@+ "..."  - just include
 * @@_+ "..." - include with indentation
 */

const 
	M = {
		thr2o        : require("through2").obj,
		path         : require("path"),
		fs           : require("fs"),
		Vinyl        : require('vinyl'),
	};

module.exports = function include() {
	return M.thr2o(
		function (file, enc, cb) {
			const res = repl(file);
			file.contents = Buffer.from(res);
			cb(null, file);
		}
	);
}

function getIncluded(p, base, includerP, includerLN) {
	const 
		rawText = M.fs.readFileSync(p, 'utf-8'),
		file = new M.Vinyl({
			cwd: process.cwd(),
			base: base,
			path: p,
			contents: Buffer.from(rawText)
		}),
		finalText = repl(file, includerP, includerLN);
	// file.contents = Buffer.from(finalText);
	return finalText;
}

function repl(file, includerP="", includerLN="") {
	const CR = {
		text: file.contents.toString(),
		i: 0,
	}
	let lineNum = 1, res = "";
	while (CR.text[CR.i]) {
		const _i = CR.i;
		let m;

		if (m = match(CR, /\n/y)) {
			lineNum ++;
			res += m[0];
		} else if (match(CR, /@@f@@/y)) {
			res += file.path.replaceAll("\\", "/");
		} else if (match(CR, /@@l@@/y)) {
			res += (lineNum).toString();
		} else if (match(CR, /@@F@@/y)) {
			res += includerP.replaceAll("\\", "/");
		} else if (match(CR, /@@L@@/y)) {
			res += includerLN.replaceAll("\\", "/");
		} else if (match(CR, /\\@@/y)) {
			res += "@@";
		} else if (m = match(CR, /@@\+\s*"([^"]+)"/y)) {
			const 
				rawPath = m[1],
				fullPath = resolvePath(file, rawPath);
			res += getIncluded(fullPath, file.base, file.path, lineNum.toString());
		} else if (m = match(CR, /@@_\+\s*"([^"]+)"/y)) {
			const 
				rawPath  = m[1],
				fullPath = resolvePath(file, rawPath),
				indent   = getIndent(CR.text, m.index),
				includedText = getIncluded(fullPath, file.base, file.path, lineNum.toString());
			res += getWithIndents(includedText, indent);
		} else {
			res += CR.text[CR.i ++];
		}

		if (_i === CR.i) {
			console.error(`(!)-USER'S `, `_i === CR.i === ${CR.i}`);
			break;
		}
	}
	return res;
}

function resolvePath(includingFile, path) {
	if (path.startsWith("." || path.startsWith(".."))) {
		return M.path.resolve(includingFile.dirname, path);
	} else if (path.startsWith("/" || path.startsWith("\\"))) {
		return M.path.join(includingFile.base, path);
	}
}

function getIndent(text, i) {
	const 
		before = text.substr(0, i),
		m = before.match(/\n([ \t]*)$/),
		indent = m ? m[1] : "";
	return indent;
}

function getWithIndents(text, indent) {
	return text.split("\n").join("\n"+indent);
}

function match(CR, t) {
	t.lastIndex = CR.i;
	const m =  t.exec(CR.text);
	if (m) {
		CR.i = t.lastIndex;
		return m;
	} else {
		return null;
	}
}