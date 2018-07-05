"use strict";



var lines = [];
var lineType = "run";
var selectedConnection	= null;
var selectedBlock	= null;
var keysPressed	= {Shift:false};

function selectConnection(el) {
	if (selectedConnection!=null) {unselectConnection();}
	addClass(el,"-selected");
	selectedConnection = el;
}
function unselectConnection() {
	if (selectedConnection!=null) {
		removeClass(selectedConnection,"-selected");
		selectedConnection = null;
	}
}
function selectBlock(el) {
	if (selectedBlock!=null) {unselectBlock();}
	addClass(el,"-selected");
	selectedBlock = el;
}
function unselectBlock() {
	if (selectedBlock!=null) {
		removeClass(selectedBlock,"-selected");
		selectedBlock = null;
	}
}





function onAddBlock() {
	document.body.appendChild(createBlock());
}
function onAddRow(type) {
	if (selectedBlock!=null) {
		addRow(selectedBlock,type);
	}
}
function onLineToggle() {
	if (lineType=="run") {
		lineType = "value";
	}
	else {
		lineType = "run";
	}
}


function createBlock() {
	var block	;
	var pointerDown	= false;
	var moving;
	var moveStart;
	var moveOffset;
	
	block = div(	"div", "block",
		createRow("input"),
		////div("span","block-input", Div.attribute("contenteditable","true"),),
		////div("button","block-addButton",Div.text("Add"),Div.event("click",(e)=>{addRow(block);}), ),///Div.event("pointerdown", (e)=>{e.preventDefault();e.stopPropagation();return false;}),
		
		Div.event("pointerdown", (e)=>{
			if (selectedBlock!=block) {
				pointerDown = true;
				moving = false;
				block.setPointerCapture(e.pointerId);
				moveStart = [e.clientX,e.clientY];
				moveOffset = [block.offsetLeft-e.clientX, block.offsetTop-e.clientY];
			}
		}),
		Div.event("pointerup", (e)=>{
			if (pointerDown && !moving) {
				if (selectedBlock!=block) {
					selectBlock(block);
				}
			}
			if (pointerDown) {
				pointerDown = false;
				moving = false;
				block.releasePointerCapture(e.pointerId);
				
				for (var line of lines) {
					moveLineBetween(line.line, line.from, line.to);
				}
			}
		}),
		Div.event("pointermove", (e)=>{
			if (moving) {
				block.style.left = e.clientX+moveOffset[0] + 'px';
				block.style.top = e.clientY+moveOffset[1] + 'px';
			}
			else if (pointerDown && (Math.abs(moveStart[0]-e.clientX)>2 || Math.abs(moveStart[1]-e.clientY)>2)) {
				moving = true;
			}
		}),
	)
	selectBlock(block);
	return block;
}

function addRow(el, type) {
	el.appendChild(
		createRow(type)
	);
}
function createRow(type) {
	function createConnection() {
		return div(	"div","block-connection","block-connection-"+lineType,
			Div.event("click",(e)=>{contactSelected(e.target);})
		);
	}
	function createInput() {
		return div(	"div","block-input",
			Div.attribute("contenteditable","true"),
		);
	}
	//---
	var el;
	if (type=="input"){
		el = div(	"div","block-row",
			createInput(),
			
			Div.event("dblclick",(e)=>{el.parentNode.removeChild(el);}),
		);
	}
	else if (type=="connection"){
		el = div(	"div","block-row",
			createConnection(),
			
			Div.event("dblclick",(e)=>{el.parentNode.removeChild(el);}),
		);
	}
	else {
		let leftSide	= type=="left"||type=="both";
		let rightSide	= type=="right"||type=="both";
		el = div(	"div","block-row",
			(leftSide	?createConnection()	:null),
			(leftSide	?createInput()	:null),
			div("div","block-row-middlePadding"),
			(rightSide	?createInput()	:null),
			(rightSide	?createConnection()	:null),
			
			Div.event("dblclick",(e)=>{el.parentNode.removeChild(el);}),
		);
	}
	return el;
}





function createLine() {
	return div(	"div", "line", "line-"+lineType);
}
function moveLine(line, x1,y1,x2,y2) {
	var r	= Math.sqrt(	((x1-x2)*(x1-x2))	+	((y1-y2)*(y1-y2))	);
	
	var midX = (x1+x2)/2;
	var midY = (y1+y2)/2;
	
	var slope	= (Math.atan2(y1-y2,x1-x2))	*180/Math.PI;
	
	line.style.width	= r	;
	line.style.left	= midX - r/2	;
	line.style.top	= midY	;
	line.style.transform	= "rotate("+slope+"deg)"	;
}
function moveLineBetween(line, el1, el2) {
	var br1 = el1.getBoundingClientRect();
	var br2 = el2.getBoundingClientRect();
	moveLine(	line		, 
		br1.left	+ br1.width/2	,
		br1.top	+ br1.height/2	,
		br2.left	+ br2.width/2	,
		br2.top	+ br2.height/2	);
}



function contactSelected(el) {
	if (selectedConnection==null) {
		selectConnection(el);
	}
	else if (selectedConnection==el) {
		removeClass(el,"block-connection-run");
		removeClass(el,"block-connection-value");
		addClass(el,"block-connection-"+lineType);
		////for (var i=lines.length-1; i>=0; i--) {
		////	let line = lines[i];
		////	if (el==line.from || el==line.to) {
		////		line.line.parentNode.removeChild(line.line);
		////		lines.splice(i,1);
		////	}
		////}
		
		unselectConnection();
	}
	else {
		var line = createLine();
		moveLineBetween(line, selectedConnection, el);
		line.addEventListener("click",(e)=>{
			for (var i=0; i<lines.length; i++) {
				if (lines[i].line == e.target) {
					e.target.parentNode.removeChild(e.target);
					lines.splice(i,1);
					break;
				}
			}
		});
		document.body.appendChild(line);
		moveLineBetween(line, selectedConnection, el);
		lines.push({line:line,from:selectedConnection,to:el});
		
		unselectConnection();
	}
}













function removeClass(el, className) {
	el.className =
		el.className
			.replace(new RegExp('(?:^|\\s)' + className + '(?:\\s|$)'), ' ')
}
function addClass(el, className) {
	el.className += " " + className
}
function hasClass(el, className) {
	if (el.className.match(new RegExp('(?:^|\\s)' + className + '(?:\\s|$)')) !== null){
		return true
	}
	return false
}


document.addEventListener("keydown",(e)=>{
	if (event.key=="Escape") {
		unselectBlock();
		unselectConnection();
	}
	if (event.key=="Shift") {
		keysPressed["Shift"] = true;
	}
});