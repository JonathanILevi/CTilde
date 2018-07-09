



class Workspace {
	constructor() {
		this.el = div("div","workspace");
		this.blocks	= {};
		this.nextBlockId	= 0;
		this.saveIds	= {};//What ids are used for ids in currently loading save;
		this.lines	= [];
		this.selectedBlocks = [];
		this.selectedContact = null;
		
		
		document.addEventListener("keydown",(e)=>{
			if (e.key=="Escape") {
				this.unselectAllBlocks();
				this.unselectContact();
			}
			else if (e.key=="Delete") {
				if (this.selectedContact==null) {
					for (var block of this.selectedBlocks) {
						this.removeBlock(block, false);
					}
					this.selectedBlocks = [];
				}
				else if (this.selectedBlocks.indexOf(this.selectedContact.block) != -1){
					this.selectedContact.block.removeDoor(this.selectedContact.dir, this.selectedContact.contactId);
				}
			}
			else {
				console.log(e.key);
			}
		});
		
	}
	addBlock(id=null) {
		if (id==null) {
			do {
				id = this.nextBlockId+"";
				this.nextBlockId++;
			} while (Object.keys(this.blocks).indexOf(id) != -1);
		}
		let newBlock = new Block(id, this,saveData);
		this.blocks[id] = newBlock;
		this.el.appendChild(newBlock.el);
		return newBlock;
	}
	addLine(line) {
		this.lines.push(line);
		this.el.appendChild(line.el);
	}
	removeBlock(block, unselect=true) {
		block.onRemove();
		this.el.removeChild(block.el);
		////remove block;
		delete this.blocks[block.id];
		if (unselect) {
			throw "not implemented";
		}
	}
	removeLine(line) {
		if (this.lines.indexOf(line) != -1) {
			this.el.removeChild(line.el);
			this.lines.splice(this.lines.indexOf(line),1);
		}
	}
	
	selectBlock(block, add=false) {
		this.unselectAllBlocks();
		block.onSelect();
		this.selectedBlocks.push(block);
	}
	unselectBlock(block, removeFromSelectedList=true) {
		block.onUnselect();
		if (removeFromSelectedList) {
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
	
	getBlockBySaveId(saveId) {
		return this.blocks[this.getIdBySaveId(saveId)];
	}
	getIdBySaveId(saveId) {
		if (Object.keys(this.saveIds).indexOf(saveId)!=-1) {
			return this.saveIds[saveId];
		}
		else {
			var id = saveId;
			{
				var addNum = 1;
				while (Object.keys(this.blocks).indexOf(id) != -1) {
					addNum++;
					id = saveId+"fs"+addNum;
				}
			}
			this.saveIds[saveId] = id;
			return id;
		}
	}
	
	getSaveData() {
		var saveData = [];
		for (var blockId of Object.keys(this.blocks)) {
			saveData.push(this.blocks[blockId].getSaveData());
		}
		return saveData;
	}
	loadSaveData(saveData) {
		this.saveIds = {};
		for (var blockData of saveData) {
			this.addBlock(this.getIdBySaveId(blockData.id))
				.loadSaveData(blockData, false);
		}
		for (var blockData of saveData) {
			this.getBlockBySaveId(blockData.id)
				.loadSaveDataConnections(blockData);
		}
	}
}





class Block {
	constructor(id, workspace) {
		this.id = id;
		this.workspace = workspace;
		
		this.domBlock = new DomBlock(id);
		this.el=this.domBlock.getEl();
		this.addMouseListeners();
		
		this.lines = [];
		
		
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
			this.addConnection(dir, contactId, otherSelected.block, otherSelected.contactId);
		}
	}
	onRemove() {
		for (var i=this.lines.length-1; i>=0; i--) {
			this.lines[i].remove();
		}
	}
	onRemoveLine(line) {
		this.lines.splice(this.lines.indexOf(line),1);
		this.workspace.removeLine(line);
	}
	
	removeDoor(dir, contactId) {
		for (var i=this.lines.length-1; i>=0; i--) {
			var contact = (	dir=="out"
				? this.lines[i].domLine.getFrom()
				: this.lines[i].domLine.getTo()	);
			if (contact.block==this.domBlock && contact.contactId==contactId) {
				this.lines[i].remove();
			}
		}
		this.workspace.unselectContact();
		this.domBlock.removeDoor(dir,contactId);
	}
	
	addLine(line) {
		this.lines.push(line);
	}
	addConnection(dir,contactId, otherBlock, otherContactId) {
		var domLine = this.domBlock.addDoorConnection(dir, contactId, otherBlock.domBlock, otherContactId);
		
		if (domLine != null) {
			var line = new Line(this, domLine);
			
			this	.addLine(line);
			otherBlock	.addLine(line);
			this.workspace	.addLine(line);
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
					for (var line of this.domBlock.getDoorConnections(dir,i)) {
						doors[dir][i].connections.push({block:line.getConnectedTo(dir).block.id, contact:line.getConnectedTo(dir).contactId});
					}
				}
			}
		}
		data	.ins	= doors.in;
		data	.outs	= doors.out;
		data	.pos	= this.domBlock.getPos();
		return data;
	}
	loadSaveData(data, loadSaveDataConnections=true) {
		this.domBlock.setHeaderText(data.header.text);
		var doors = {"in":data.ins, "out":data.outs};
		{
			for (var dir of ["in","out"]) {
				for (var i=0; i<doors[dir].length; i++) {
					this.domBlock.addDoor(dir);
					this.domBlock.setDoorText(dir, i, doors[dir][i].text);
				}
			}
		}
		this.domBlock.setPos(data.pos);
		if (loadSaveDataConnections) {
			this.loadSaveDataConnections(data);
		}
		return this.domBlock;
	}
	loadSaveDataConnections(data) {
		var doors = {"in":data.ins, "out":data.outs};
		{
			for (var dir of ["in","out"]) {
				for (var i=0; i<doors[dir].length; i++) {
					for (var connection of doors[dir][i].connections) {
						let otherBlock = workspace.getBlockBySaveId(connection.block);
						this.addConnection(dir,i, otherBlock, connection.contact)
					}
				}
			}
		}
	}
}


class Line {
	constructor(block, domLine) {
		this.block	= block;
		this.domLine	= domLine;
		this.el = domLine.getEl();
	}
	
	remove() {
		this.domLine.remove();
		this.block.onRemoveLine(this);
	}
}