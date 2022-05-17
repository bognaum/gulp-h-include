gulp-h-include
==============

This plugin is designed to assemble HTML files from separate parts, and to and debugging marks to the files during development.

 - includes separate parts of HTML file.
 - adds debugging marks with name of file and line number like `__FILE__` and `__LINE__` in PHP.

 How it works
 ------------

`@@f@@` - file pathname

`@@l@@` - line number

`@@F@@` - pathname of the file that including this file

`@@L@@` - a line number of the file that including this file

`@@+ "/foo/bar.html"`  - include with path from base

`@@+ "./foo/bar.html"` - include with path from including file

`@@+ "..."`  - just include

`@@_+ "..."` - include with indentation to prettify result code

`\\@@` - changing to `@@`