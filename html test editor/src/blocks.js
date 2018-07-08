



class Workspace {
	constructor(workspaceEl) {
		this.workspaceEl = workspaceEl;
		this.blocks	= [];
		this.lines	= [];
		this.selectedBlocks = [];
		this.selectedContact = null;
	}
	addBlock(saveData) {
		let newBlock = new Block(this.blocks.length+"", this,saveData);
		this.blocks.push(newBlock);
		this.workspaceEl.appendChild(newBlock.el);
	}
	addLine(line) {
		this.lines.push(line);
		this.workspaceEl.appendChild(line.getEl());
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
	
	selectContact(block, dir, contactId) {
		if (this.selectedContact==null) {
			block.onContactSelected(dir, contactId,this.selectedContact);
			this.selectedContact = {block:block, dir:dir, contactId:contactId};
		}
		else {
			block.onConnection(dir, contactId,this.selectedContact);
			this.unselectContact();
		}
	}
	unselectContact() {
		if (this.selectedContact!=null) {
			this.selectedContact.block.onContactUnselected(this.selectedContact.dir, this.selectedContact.contactId);
			this.selectedContact = null;
		}
	}
	
	
	getSaveData() {
		var saveData = [];
		for (var block of this.blocks) {
			saveData.push(block.getSaveData());
		}
		return saveData;
	}
	loadSaveData(saveData) {
		for (var blockData of JSON.parse(saveData)) {
			this.addBlock(blockData);
		}
	}
}





class Block {
	constructor(id, workspace, saveData=null) {
		this.id = id;
		this.workspace = workspace;
		
		this.domBlock = new DomBlock(id);
		if (saveData!=null) {
			this.loadSaveData(saveData);
		}
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
	onContactSelected(dir, contactId, otherSelected) {
		this.domBlock.selectDoor(dir, contactId);
	}
	onContactUnselected(dir, contactId) {
		this.domBlock.unselectDoor();
	}
	onConnection(dir,contactId, otherSelected) {
		if (otherSelected.dir!=dir) {
			this.workspace.addLine(this.domBlock.addDoorConnection(dir,contactId,otherSelected.block.domBlock,otherSelected.contactId));
		}
	}
	
	addMouseListeners() {
		var pointerDown	= false;
		var moving;
		var moveStart;
		var moveOffset;
		
		this.domBlock.addBlockListener("pointerdown", (e)=>{
			if (!this.domBlock.getSelected()) {
				pointerDown = true;
				moving = false;
				this.el.setPointerCapture(e.pointerId);
				moveStart = [e.clientX,e.clientY];
				moveOffset = [this.el.offsetLeft-e.clientX, this.el.offsetTop-e.clientY];
				e.preventDefault();
			}
		});
		this.domBlock.addBlockListener("pointerup", (e)=>{
			if (pointerDown && !moving) {
				if (!this.domBlock.getSelected()) {
					this.workspace.selectBlock(this);
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
		this.domBlock.addBlockListener("pointermove", (e)=>{
			if (moving) {
				this.domBlock.setPos([e.clientX+moveOffset[0], e.clientY+moveOffset[1]])
				e.preventDefault();
			}
			else if (pointerDown && (Math.abs(moveStart[0]-e.clientX)>2 || Math.abs(moveStart[1]-e.clientY)>2)) {
				moving = true;
				e.preventDefault();
			}
		});
		
		this.domBlock.addContactListener("click",(dir,contactId,e)=>{
			this.workspace.selectContact(this,dir,contactId);
		});
	}
	
	getSaveData() {
		var data = {};
		data	.id	= this.id;
		data	.header	= {text: this.domBlock.getHeaderText()};
		var doors = {in:[],out:[]};
		{
			for (var dir of ["in","out"]) {
				for (var i=0; i<this.domBlock.getNumDoors(dir); i++) {
					doors[dir].push(	{	text: this.domBlock.getDoorText(dir,i), 
							connections:[],
						}
					);
					for (var connection of this.domBlock.getDoorConnections(dir,i)) {
						doors[dir][i].connections.push({block:connection.block.id, contact:connection.block.getDoorText(dir=="in"?"out":"in", connection.contactId)});
					}
				}
			}
		}
		data	.ins	= doors.in;
		data	.outs	= doors.out;
		data	.pos	= this.domBlock.getPos();
		return data;
	}
	loadSaveData(data) {
		this.domBlock.setHeaderText(data.header.text);
		for (var i=0; i<data.ins.length; i++) {
			this.domBlock.addDoor("in");
			this.domBlock.setDoorText("in", i, data.ins[i].text);
		}
		for (var i=0; i<data.outs.length; i++) {
			this.domBlock.addDoor("out");
			this.domBlock.setDoorText("out", i, data.outs[i].text);
		}
		this.domBlock.setPos(data.pos);
		return this.domBlock;
	}
}


