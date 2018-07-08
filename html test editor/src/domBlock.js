


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
		return this._doorInputs[dir][id].innerText;
	}
	setDoorText(dir, id, text) {
		this._doorInputs[dir][id].innerText = text;
	}
	getDoorContact(dir, id) {
		return this._doorContacts[dir][id].innerText;
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
	}
	
	
	
	getSaveData() {
		var data = {};
		data	.header	= {text: this.getHeaderText()};
		data	.ins	= [];
		for (var i=0; i<this.getNumDoors("in"); i++) {
			data.ins.push({text: this.getDoorText("in",i)});
		}
		data	.outs	= [];
		for (var i=0; i<this.getNumDoors("out"); i++) {
			data.outs.push({text: this.getDoorText("out",i)});
		}
	
		data	.pos	= this.getPos();
		return data;
	}
	setSaveData(data) {
		this.setHeaderText(data.header.text);
		for (var i=0; i<data.ins.length; i++) {
			this.addDoor("in");
			this.setDoorText("in", i, data.ins[i].text);
		}
		for (var i=0; i<data.outs.length; i++) {
			this.addDoor("out");
			this.setDoorText("out", i, data.outs[i].text);
		}
		this.setPos(data.pos);
		return this;
	}
}