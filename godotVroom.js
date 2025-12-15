/*

========================
=   Godot-Vroom 0.0.1  =
=   proof of concept   =
=   (by Ethan Clark)   =
========================

Godot-Vroom is designed to optimized Godot 4.X web exports by wrapping certain webgl2 calls to make use of cached values.

Specifically, it caches values to avoid calling gl.getParameter as much as possible.
This leads to web exports being up to twice as fast (give or take, results may vary.)

To use Vroom in your Godot web exports, use a custom shell file and use Vroom as a script in it.

Vroom unfortunately causes a bug where the game appears squashed, but this can be mitigated.
Do the following to fix the issue:
	-set "canvas resize policy" (html/canvas_resize_policy) in the web export settings to "None"
	-set VROOM_ASPECT_RATIO to the aspect ratio of your choosing (width divided by height.)
Vroom will then resize and reposition the canvas so that it will display correctly no matter what size the screen is.

Set VROOM_ASPECT_RATIO to -1.0 to make Vroom not resize and reposition the canvas.

*/

"use strict";

//true: Vroom is enabled.
//false: Vroom is disabled.
let ENABLE_VROOM = true;

//-1.0: Vroom will not try to scale/position the canvas.
//otherwise: Vroom will automatically scale and position the canvas element to keep the given aspect ratio (width divided by height.) 
let VROOM_ASPECT_RATIO = 16.0/9.0;

if(ENABLE_VROOM){
	
	let canvasElements = document.getElementsByTagName("canvas");
	
	if(canvasElements.length == 0){
		
		console.log("Error: Vroom can't find canvas element.");
		
	}else{
		
		let canvasElement = canvasElements.item(0);
		
		let ctx = canvasElement.getContext("webgl2");
		
		let cachedActiveTexture = null;
		let cachedShaderProgram = null;
		let cachedTextureBinding2D = null;
		
		let cachedBlend = false;
		let cachedCullFace = false;
		let cachedDepthTest = false;
		let cachedScissorTest = false;
		let cachedStencilTest = false;
		
		let baseActiveTexture = ctx.activeTexture;
		let baseUseProgram = ctx.useProgram;
		let baseGetParameter = ctx.getParameter;
		let baseDisable = ctx.disable;
		let baseEnable = ctx.enable;
		let baseBindTexture = ctx.bindTexture;
		
		ctx.activeTexture = function(texture){
			
			cachedActiveTexture = texture;
			baseActiveTexture.call(ctx,texture);
			
		}
		
		ctx.bindTexture = function(target, texture){
			
			//TEXTURE_BINDING_2D
			if(target == 32873){
				
				cachedTextureBinding2D = texture;
				
			}
			
			baseBindTexture.call(ctx,target,texture);
			
		}
		
		ctx.disable = function(cap){
			
			switch(cap){
				case 3042:
					//BLEND
					cachedBlend = false;
				case 3089:
					//SCISSOR_TEST
					cachedScissorTest = false;
				case 2960:
					//STENCIL_TEST
					cachedStencilTest = false;
				case 2929:
					//DEPTH_TEST
					cachedDepthTest = false;
				case 2884:
					//CULL_FACE
					cachedCullFace = false;
			}
			
			baseDisable.call(ctx,cap);
			
		}
		
		ctx.enable = function(cap){
			
			switch(cap){
				case 3042:
					//BLEND
					cachedBlend = true;	
				case 3089:
					//SCISSOR_TEST
					cachedScissorTest = true;
				case 2960:
					//STENCIL_TEST
					cachedStencilTest = true;
				case 2929:
					//DEPTH_TEST
					cachedDepthTest = true;
				case 2884:
					//CULL_FACE
					cachedCullFace = true;
			}
			
			baseEnable.call(ctx,cap);
			
		}
		
		ctx.useProgram = function(program){
			
			cachedShaderProgram = program;
			baseUseProgram.call(ctx,program);
			
		}
		
		ctx.getParameter = function(param){
			
			switch(param){
				case 35725:
					//CURRENT_PROGRAM
					return(cachedShaderProgram);
				case 3042:
					//BLEND
					return(cachedBlend);
				case 3089:
					//SCISSOR_TEST
					return(cachedScissorTest);
				case 2960:
					//STENCIL_TEST
					return(cachedStencilTest);
				case 2929:
					//DEPTH_TEST
					return(cachedDepthTest);
				case 2884:
					//CULL_FACE
					return(cachedCullFace);
				case 32873:
					//TEXTURE_BINDING_2D
					return(cachedTextureBinding2D);
				case 34016:
					//ACTIVE_TEXTURE
					return(cachedActiveTexture);
				default:
					return(baseGetParameter.call(ctx,param));	
			}
			
		};
		
		let contextAlreadyGotten = false;
		
		canvasElement.getContext = function(type){
			
			if(!contextAlreadyGotten){
				
				console.log("Vroom enabled.");
				contextAlreadyGotten = true;
				
			}
			
			return(ctx);
			
		}
		
		if(VROOM_ASPECT_RATIO != -1.0){
			
			canvasElement.style.position = "relative";
			canvasElement.style.display = "block";
			canvasElement.style.top = "50%";
			canvasElement.style.left = "50%";
			canvasElement.style.transform = " translate(-50%, -50%)";
			
			function setCanvasSize(event){
				
				let cw = window.innerWidth;
				let ch = window.innerHeight;
				
				cw = Math.min(cw,ch*VROOM_ASPECT_RATIO);
				ch = Math.min(ch,cw/VROOM_ASPECT_RATIO);
				
				canvasElement.width = cw;
				canvasElement.height = ch;
				
			}
			
			addEventListener("resize", setCanvasSize);
			
			setCanvasSize();
			
		}
		
	}
	
}