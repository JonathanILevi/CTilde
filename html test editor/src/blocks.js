



class Blocks {
	constructor(codeEl) {
		this.codeEl = codeEl;
		this.blocks = [];
		this.selectedBlocks = [];
	}
	addBlock() {
		let newBlock = new Block(this);
		this.blocks.push(newBlock);
		this.codeEl.appendChild(newBlock.el);
	}
	selectBlock(block, add=false) {
		this.unselectAllBlocks();
		block.onSelect();
		this.selectedBlocks.push(block);
	}
	unselectBlock(block, remove=true) {
		block.onUnselect();
		if (remove) {
			throw "not implemented";
		}
	}
	unselectAllBlocks() {
		for (var block of this.selectedBlocks) {
			this.unselectBlock(block, false);
		}
		this.selectedBlocks = [];
	}
}

class Block {
	constructor(blocks) {
		this.blocks = blocks;
		this.selected = false;
		
		this.leftSide = [];
		this.rightSide = [];
		
		this.createEl();
		
		
		document.addEventListener("keydown",(e)=>{
			if (this.selected && e.ctrlKey) {
				if (e.key=="l") {
					this.leftSide.push({"text":"","connection":null});
					this.updateEl();
					e.preventDefault();
				}
				else if (e.key=="r") {
					this.rightSide.push({"text":"","connection":null});
					this.updateEl();
					e.preventDefault();
				}
			}
		});
	}
	
	createEl() {
		this.el = createBlock(this.leftSide,this.rightSide);
		this.addMouseListeners();
	}
	updateEl() {
		var oldEl = this.el;
		var parent = this.el.parentElement;
		this.createEl();
		parent.replaceChild(this.el,oldEl);
		if(this.selected) {
			this.onSelect();
		}
	}
	
	onSelect() {
		this.selected = true;
		this.el.classList.add("-selected");
	}
	onUnselect() {
		this.selected = false;
		this.el.classList.remove("-selected");
	}
	
	addMouseListeners() {
		var pointerDown	= false;
		var moving;
		var moveStart;
		var moveOffset;
		
		this.el.addEventListener("pointerdown", (e)=>{
			if (!this.selected) {
				pointerDown = true;
				moving = false;
				this.el.setPointerCapture(e.pointerId);
				moveStart = [e.clientX,e.clientY];
				moveOffset = [this.el.offsetLeft-e.clientX, this.el.offsetTop-e.clientY];
				e.preventDefault();
			}
		});
		this.el.addEventListener("pointerup", (e)=>{
			if (pointerDown && !moving) {
				if (!this.selected) {
					this.blocks.selectBlock(this);
				}
			}
			if (pointerDown) {
				pointerDown = false;
				moving = false;
				this.el.releasePointerCapture(e.pointerId);
				
				////for (var line of lines) {
				////	moveLineBetween(line.line, line.from, line.to);
				////}
			}
		});
		this.el.addEventListener("pointermove", (e)=>{
			if (moving) {
				this.el.style.left = e.clientX+moveOffset[0] + 'px';
				this.el.style.top = e.clientY+moveOffset[1] + 'px';
				e.preventDefault();
			}
			else if (pointerDown && (Math.abs(moveStart[0]-e.clientX)>2 || Math.abs(moveStart[1]-e.clientY)>2)) {
				moving = true;
				e.preventDefault();
			}
		});
	}
}


function createBlock(leftSide,rightSide) {
	function createRow(l,r) {
		function createContact() {
			return div(	"div","block-contact",
				////Div.event("click",(e)=>{contactSelected(e.target);})
			);
		}
		function createInput(side) {
			return div(	"div","block-input",
				"block-input-"+side,
				Div.attribute("contenteditable","true"),
			);
		}
		//---
		el = div(	"div","block-row",
			(l	?createContact()	:null),
			(l	?createInput("left")	:null),
			(r	?createInput("right")	:null),
			(r	?createContact()	:null),
		);
		return el;
	}
	
	
	block = div("div","block", createRow(true,false));
	
	for(var i=0; i<Math.max(leftSide.length,rightSide.length); i++) {
		block.appendChild(createRow(i<leftSide.length, i<rightSide.length));
	}
	
	return block;
}