



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
		
		this.domBlock = new DomBlock();
		this.el=this.domBlock.getEl();
		this.addMouseListeners();
		
		
		document.addEventListener("keydown",(e)=>{
			if (this.domBlock.getSelected() && e.ctrlKey) {
				if (e.key=="l") {
					this.domBlock.addDoor("in");
					e.preventDefault();
				}
				else if (e.key=="r") {
					try {
						this.domBlock.addDoor("out");
					} catch{};
					e.preventDefault();
				}
			}
		});
	}
	
	onSelect() {
		this.domBlock.setSelected(true);
	}
	onUnselect() {
		this.domBlock.setSelected(false);
	}
	
	addMouseListeners() {
		var pointerDown	= false;
		var moving;
		var moveStart;
		var moveOffset;
		
		this.el.addEventListener("pointerdown", (e)=>{
			if (!this.domBlock.getSelected()) {
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
				if (!this.domBlock.getSelected()) {
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
				this.domBlock.setPos([e.clientX+moveOffset[0], e.clientY+moveOffset[1]])
				e.preventDefault();
			}
			else if (pointerDown && (Math.abs(moveStart[0]-e.clientX)>2 || Math.abs(moveStart[1]-e.clientY)>2)) {
				moving = true;
				e.preventDefault();
			}
		});
	}
}


class DomBlock {
	constructor() {
		this._el	;
		this._header	;
		this._headerContact	;
		this._headerInput	;
		this._doorRows	=[];
		this._doorContacts	={in:[],out:[]};
		this._doorInputs	={in:[],out:[]};
		
		this._pos	= [0,0];
		this._selected	= false;
		
		
		this._el = div("div","block",
			this._cRow(	(el)=>{this._header=el},
				this._cDoor(	"in", (contact,input)=>{this._headerContact=contact;this._headerInput=input;}
				),
				null,
			),
			////createRow(	true,false, (row,contact,input)=>{	this._header	=row	;
			////		this._headerContact	=contact	;
			////		this._headerInput	=input	;	}),
		)
	}
	
	_addRowEl(row) {
		this._el.appendChild(row);
	}
	_addDoorToRow(dir,rowEl,door){
		if (dir=="in") {
			rowEl.insertBefore(door.input	, rowEl.childNodes[0]);
			rowEl.insertBefore(door.contact	, rowEl.childNodes[0]);
		}
		else {
			rowEl.appendChild(door.input);
			rowEl.appendChild(door.contact);
		}
	}
	_cDoor(dir,callback) {
		var door={
			contact:div("div","block-contact","-"+dir,),
			input:div(	"div","block-input","-"+dir,
				Div.attribute("contenteditable","true"),
			)
		}
		if (callback) callback(door.contact, door.input);
		return door;
	}
	_cRow(callback,in_,out) {
		var rowEl=div("div","block-row");
		if (in_) {
			rowEl.appendChild(in_.contact);
			rowEl.appendChild(in_.input);
			
		}
		if (out) {
			rowEl.appendChild(out.input);
			rowEl.appendChild(out.contact);
			
		}
		callback(rowEl);
		return rowEl;
	}
	
	getEl() {
		return this._el;
	}
	
	getHeaderText() {
		this._headerContact.innerText;
	}
	setHeaderText(text) {
		this._headerContact.innerText=text;
	}
	
	addDoor(dir, text) {
		if (this.getNumDoors(dir)<this._doorRows.length) {
			this._addDoorToRow(	dir,
				this._doorRows[this.getNumDoors(dir)],
				this._cDoor(	dir, (contact,input)=>{this._doorContacts[dir].push(contact);this._doorInputs[dir].push(input);}),
			);
		}
		else {
			let door = this._cDoor(	dir, (contact,input)=>{	this._doorContacts	[dir]	.push(contact)	;
						this._doorInputs	[dir]	.push(input)	;	});
			
			this._cRow(	(row)=>{this._addRowEl(row);this._doorRows.push(row);},
				dir=="in"?door:null,
				dir=="out"?door:null,
			);
		}
	}
	getDoorText(dir, id) {
		this._doorInputs[dir][id].innerText;
	}
	setDoorText(dir, id, text) {
		this._doorInputs[dir][id].innerText = text;
	}
	getNumDoors(dir) {
		return this._doorInputs[dir].length;
	}
	
	
	
	getPos() {
		return this._pos;
	}
	setPos(pos) {
		this._pos = pos;
		this._el.style.left	= pos[0]+"px";
		this._el.style.top	= pos[1]+"px";
	}
	
	getSelected() {
		return this._selected;
	}
	setSelected(selected) {
		this._selected = selected;
		if (selected) {
			this._el.classList.add("-selected");
		}
		else {
			this._el.classList.remove("-selected");
		}
	}
}
