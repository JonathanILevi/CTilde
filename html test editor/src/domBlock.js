


class DomBlock {
	constructor(id) {
		this.id = id;
		this._el	;
		this._header	;
		this._headerContact	;
		this._headerInput	;
		this._headerConnections	=[];
		this._doorRows	=[];
		this._doorContacts	={in:[],out:[]};
		this._doorInputs	={in:[],out:[]};
		this._doorConnections	={in:[],out:[]};
		this._selectedDoor	={dir:null,id:null};
		
		this._pos	= [0,0];
		this._selected	= false;
		
		this._contactListeners = [];
		
		
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
	_removeRowEl(row) {
		this._el.removeChild(row);
	}
	_addDoorToRow(dir,rowEl,door){
		if (dir=="in") {
			rowEl.insertBefore(door.input	, rowEl.firstChild);
			rowEl.insertBefore(door.contact	, rowEl.firstChild);
		}
		else {
			rowEl.appendChild(door.input);
			rowEl.appendChild(door.contact);
		}
	}
	_removeDoorFromRow(dir,rowEl){
		if (dir=="in") {
			rowEl.removeChild(rowEl.firstChild);
			rowEl.removeChild(rowEl.firstChild);
		}
		else {
			rowEl.removeChild(rowEl.lastChild);
			rowEl.removeChild(rowEl.lastChild);
		}
	}
	_addDoorToRowId(dir, rowId, door) {
		if (rowId<this._doorRows.length) {
			this._addDoorToRow(dir, this._doorRows[rowId], door);
		}
		else {
			this._cRow(	(row)=>{this._addRowEl(row);this._doorRows.push(row);},
				dir=="in"?door:null,
				dir=="out"?door:null,
			);
		}
	}
	_cDoor(dir,callback) {
		var door={
			contact:div("div","block-contact","-"+dir,Div.events(this._contactListeners)),
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
		return this._headerInput.innerText;
	}
	setHeaderText(text) {
		this._headerInput.innerText=text;
	}
	
	addDoor(dir) {
		let doorId = this.getNumDoors(dir);
		
		let door = this._cDoor(	dir, (contact,input)=>{	this._doorContacts	[dir]	.push(contact)	;
				this._doorInputs	[dir]	.push(input)	;	});
		this._doorConnections[dir].push([]);
		
		this._addDoorToRowId(dir, doorId, door);
	}
	removeDoor(dir, id) {
		if (id < this.getNumDoors(dir=="out"?"in":"out")) {
			for (var i=id; i<this.getNumDoors(dir); i++) {
				if (i==this.getNumDoors(dir)-1 && i>=this.getNumDoors(dir=="out"?"in":"out")) {
					this._removeRowEl(this._doorRows[i]);
					this._doorRows.splice(i,1);
				}
				else {
					this._removeDoorFromRow(	dir,
						this._doorRows[i],
					);
				}
				if (i>id) {
					this._addDoorToRow(dir, this._doorRows[i-1], {input:this._doorInputs[dir][i], contact:this._doorContacts[dir][i]})
				}
			}
		}
		else {
			this._removeRowEl(this._doorRows[id]);
			this._doorRows.splice(id,1);
		}
		this._doorInputs	[dir].splice(id,1);
		this._doorContacts	[dir].splice(id,1);
		this._doorConnections	[dir].splice(id,1);
		
		for (var i=id; i<this.getNumDoors(dir); i++) {
			for (var connection of this._doorConnections[dir][i]) {
				if (dir=="in") {
					connection.setTo(this, i, true);
				}
				if (dir=="out") {
					connection.setFrom(this, i, true);
				}
			}
		}
	}
	getDoorText(dir, id) {
		if (dir=="in"&&id==-1) {
			return this.getHeaderText();
		}
		return this._doorInputs[dir][id].innerText;
	}
	setDoorText(dir, id, text) {
		if (dir=="in"&&id==-1) {
			return this.setHeaderText(text);
		}
		this._doorInputs[dir][id].innerText = text;
	}
	getDoorContact(dir, id) {
		if (dir=="in"&&id==-1) {
			return this._headerContact;
		}
		return this._doorContacts[dir][id];
	}
	getNumDoors(dir) {
		return this._doorInputs[dir].length;
	}
	getDoorByText(dir, text) {
		for (var i=0; i<this.getNumDoors(dir); i++) {
			if (this.getDoorText(dir,i)==text) {
				return i;
			}
		}
		return null;
	}
	
	selectDoor(dir,id) {
		this._selectedDoor = {dir:dir, id:id};
		this.getDoorContact(dir,id).classList.add("-selected");
	}
	unselectDoor() {
		this.getDoorContact(this._selectedDoor.dir,this._selectedDoor.id).classList.remove("-selected");
		this._selectedDoor = {dir:null, id:null};
	}
	
	addDoorConnection(dir,contactId,toBlock,toContactId) {
		var line = new DomLine();
		this	._addDoorConnection(dir	,contactId	,toBlock	,toContactId	,line);
		toBlock	._addDoorConnection(dir=="out"?"in":"out"	,toContactId	,this	,contactId	,line);
		line.updateRender();
		return line;
	}
	_addDoorConnection(dir,id,toBlock,toContactId, line) {
		if (dir=="in"&&id==-1) {
			this._headerConnections.push(line);
		}
		else {
			this._doorConnections[dir][id].push(line);
		}
		if (dir=="out") {
			line.setFrom(this,id, false);
		}
		else {
			line.setTo(this,id, false);
		}
	}
	
	
	getDoorConnections(dir,id) {
		if (dir=="in"&&id==-1) {
			return this._headerConnections;
		}
		return this._doorConnections[dir][id];
	}
	
	_removeDoorConnection(dir, id, line) {
		for (var i=this.getDoorConnections(dir,id).length-1; i>=0; i++) {
			if (connection.line==line) {
				if (dir=="in"&&id==-1) {
					this._headerConnections.splice(i,1);
				}
				else {
					this._doorConnections.splice(i,1);
				}
				break;
			}
		}
	}
	
	
	
	getPos() {
		return this._pos;
	}
	setPos(pos) {
		this._pos = pos;
		this._el.style.left	= pos[0]+"px";
		this._el.style.top	= pos[1]+"px";
		for (var dir of ["in","out"]) {
			for (var i=0; i<this.getNumDoors(dir); i++) {
				for (var connection of this._doorConnections[dir][i]) {
					connection.updateRender();
				}
			}
		}
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
	
	
	
	
	addBlockListener(event, callback) {
		this._el.addEventListener(event, callback);
	}
	addContactListener(event, callback) {
		var modCallback = (e)=>{
			for (var dir of ["in","out"]) {
				for (var i=0; i<this.getNumDoors(dir); i++) {
					if (this.getDoorContact(dir,i)==e.target) {
						return callback(dir,i,e);
					}
				}
			}
			throw "Error";
		}
		this._contactListeners.push([event, modCallback]);
		for (var dir of ["in","out"]) {
			for (var contact of this._doorContacts[dir]) {
				contact.addEventListener(event,modCallback);
			}
		}
		this._headerContact.addEventListener(event,(e)=>{callback("in",-1,e)});
	}
	
	
}



class DomLine {
	constructor() {
		this._el	;
		this._from	= {block:null,contactId:null};
		this._to	= {block:null,contactId:null};
		
		this._el = div("div", "line");
	}
	
	
	getEl() {
		return this._el;
	}
	
	getFrom() {
		return this._from;
	}
	getTo() {
		return this._to;
	}
	
	setFrom(block, contactId, updateRender=true) {
		this._from = {block:block, contactId:contactId};
		if (updateRender) {
			this.updateRender();
		}
	}
	setTo(block, contactId, updateRender=true) {
		this._to = {block:block, contactId:contactId};
		if (updateRender) {
			this.updateRender();
		}
	}
	
	
	getConnectedTo(dir) {
		if (dir=="out") {
			return this.getTo();
		}
		else {
			return this.getFrom();
		}
	}
	
	
	
	updateRender() {
		var br1 = this._from.block.getDoorContact("out",this._from.contactId).getBoundingClientRect();
		var br2 = this._to.block.getDoorContact("in",this._to.contactId).getBoundingClientRect();
		this._moveLine(	br1.left	+ br1.width/2	,
			br1.top	+ br1.height/2	,
			br2.left	+ br2.width/2	,
			br2.top	+ br2.height/2	);
	}
	
	_moveLine(x1,y1,x2,y2) {
		var r	= Math.sqrt(	((x1-x2)*(x1-x2))	+	((y1-y2)*(y1-y2))	);
	
		var midX = (x1+x2)/2;
		var midY = (y1+y2)/2;
	
		var slope	= (Math.atan2(y1-y2,x1-x2))	*180/Math.PI;
	
		this._el.style.width	= r	;
		this._el.style.left	= midX - r/2	;
		this._el.style.top	= midY	;
		this._el.style.transform	= "rotate("+slope+"deg)"	;
	}
	
	remove() {
		this._from.block._removeDoorConnection("out",this._from.contactId,this);
		this._to.block._removeDoorConnection("in",this._to.contactId,this);
	}
}