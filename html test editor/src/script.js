"use strict";


function add() {
	document.body.appendChild(createBlock());
}


function createBlock() {
	var block	;
	var moving	= false;
	var moveStart;
	var moveOffset;
	
	function addRow(el) {
		el.appendChild(
			createRow()
		);
	}
	block = div(	"div", "block",
		div("span","block-input", Div.attribute("contenteditable","true"),),
		div("button","block-addButton",Div.text("Add"),Div.event("click",(e)=>{addRow(block);}), Div.event("pointerdown", (e)=>{e.preventDefault();e.stopPropagation();return false;}),),
		
		Div.event("pointerdown", (e)=>{
			moving = true;
			block.setPointerCapture(e.pointerId);
			moveStart = [e.clientX,e.clientY];
			moveOffset = [block.offsetLeft-e.clientX, block.offsetTop-e.clientY];
		}),
		Div.event("pointerup", (e)=>{
			if (moving) {
				moving = false;
				block.releasePointerCapture(e.pointerId);
				
				for (var line of lines) {
					moveLineBetween(line.line, line.from, line.to);
				}
			}
		}),
		Div.event("pointermove", (e)=>{
			if (moving && (Math.abs(moveStart[0]-e.clientX)>2 || Math.abs(moveStart[1]-e.clientY)>2)) {
				block.style.left = e.clientX+moveOffset[0] + 'px';
				block.style.top = e.clientY+moveOffset[1] + 'px';
			}
		}),
	)
	
	return block;
}

function createRow() {
	function createConnection() {
		return div(	"div","block-connection",
			Div.event("click",(e)=>{contactSelected(e.target);})
		);
	}
	function createInput() {
		return div(	"div","block-input",
			Div.attribute("contenteditable","true"),
		);
	}
	return div(	"div","block-row",
		createConnection(),
		createInput(),
		div("div","block-row-middlePadding"),
		createInput(),
		createConnection(),
	);
}





function createLine() {
	return div(	"div", "line",);
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



var lines = [];

var selectedContact = null;
function contactSelected(el) {
	if (selectedContact==null) {
		selectedContact = el;
		selectedContact.style.background = "red";
	}
	else if (selectedContact==el) {
		for (var i=lines.length-1; i>=0; i--) {
			let line = lines[i];
			if (el==line.from || el==line.to) {
				line.line.parentNode.removeChild(line.line);
				lines.splice(i,1);
			}
		}
		
		selectedContact.style.background = null;
		selectedContact = null;
	}
	else {
		var line = createLine();
		moveLineBetween(line, selectedContact, el);
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
		moveLineBetween(line, selectedContact, el);
		lines.push({line:line,from:selectedContact,to:el});
		
		selectedContact.style.background = null;
		selectedContact = null;
	}
}