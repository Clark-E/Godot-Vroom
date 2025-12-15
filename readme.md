```
========================
=   Godot-Vroom 0.0.1  =
=   proof of concept   =
=   (by Ethan Clark)   =
========================
```

Godot-Vroom is designed to optimized Godot 4.X web exports by wrapping certain webgl2 calls to make use of cached values.

Specifically, it caches values to avoid calling gl.getParameter as much as possible.
This leads to web exports being up to twice as fast (give or take, results may vary.)

To use Vroom in your Godot web exports, use a custom shell file and include Vroom as a script in it.

Vroom unfortunately causes a bug where the game appears squashed, but this can be mitigated.
Do the following to fix the issue:
	-set "canvas resize policy" (html/canvas_resize_policy) in the web export settings to "None"
	-set VROOM_ASPECT_RATIO to the aspect ratio of your choosing (width divided by height.)
Vroom will then resize and reposition the canvas so that it will display correctly no matter what size the screen is.

Set VROOM_ASPECT_RATIO to -1.0 to make Vroom not resize and reposition the canvas.