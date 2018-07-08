



class Workspace {
	constructor(workspaceEl) {
		this.workspaceEl = workspaceEl;
		this.blocks = [];
		this.selectedBlocks = [];
	}
	addBlock(saveData) {
		let newBlock = new Block(this,saveData);
		this.blocks.push(newBlock);
		this.workspaceEl.appendChild(newBlock.el);
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
	constructor(workspace, saveData=null) {
		this.workspace = workspace;
		
		this.domBlock = new DomBlock();
		if (saveData!=null) {
			this.domBlock.setSaveData(saveData);
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
	
	getSaveData() {
		return this.domBlock.getSaveData();
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
		
		this.domBlock.addContactListener("click",(e)=>{
			this.workspace.selectContact(e);
		});
	}
}


