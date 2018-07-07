"use strict";

var testData = {
	"blocks":[
		{
			"id":"import",
			"type":"Import",
			"ins":[
			],
			"outs":[
				{
					"name":"Std.write",
					"connections":[
						{
							"connectionBlock":"write",
							"connectionContact":"func",
						}
					]
				},
			]
		},
		{
			"id":"run",
			"type":"Run",
			"ins":[
			],
			"outs":[
				{
					"name":"run",
					"connections":[
						{
							"connectionBlock":"write",
							"connectionContact":"run",
						}
					]
				}	
			]
		},
		{
			"id":"write",
			"type":"Call",
			"ins":[
				{
					"name":"run",
					"connections":[
						{
							"connectionBlock":"run",
							"connectionContact":"run",
						}
					]
				},
				{
					"name":"func",
					"connections":[
						{
							"connectionBlock":"import",
							"connectionContact":"Std.write",
						}
					]
				},
				{
					"name":"value",
					"connections":[
						{
							"connectionBlock":"string",
							"connectionContact":"Hello World!",
						}
					]
				},
			],
			"outs":[
			]
		},
		{
			"id":"string",
			"type":"Value",
			"ins":[
				{
					"name":"String",
					"connections":[
					]
				},
			],
			"outs":[
				{
					"name":"Hello World!",
					"connections":[
						{
							"connectionBlock":"write",
							"connectionContact":"value",
						}
					]
				}
			]
		},
	]
}


function assert(condition,msg) {
	if (!condition) {
		throw msg;
	}


function interpret(data) {
	function getBlock(id) {
		for (var block of data) {
			if (block.id == id) {
				return block;
			}
		}
	}
	function getContact(contacts, name) {
		for (var contact of contacts) {
			if (contact.name == name) {
				return contact;
			}
		}
	}
	function evalBlock(block) {
		if (block.type=="Run") {
			let runContact = getContact(block.outs, "run");
			assert(runContact.connections.length==1, "One and only one connection allowed on run");
			evalBlock(getBlock(runContact.connections[0].connectionBlock));
		}
		else if (block.type=="run") {
			let funcContact = getContact(block.ins, "func");
			assert(funcContact.connections.length==1, "One and only one connection allowed for a value input");
			data = evalBlock(getBlock(funcContact.connections[0].connectionBlock));
			let insClone = deepCopy(block.ins);
			delete insClone.func;
			delete insClone.run;
			data[funcContact.connections[0].connectionContact](insClone);
		}
	}
	
	var run = getBlock("run");
	getContact(run.outs, "run");
	
	var cur = getBlock("run");
	while (true) {
		if (cur.type=="Run")
	}
	
}
	
function deepCopy(obj) {
  return Object.keys(obj).reduce((v, d) => Object.assign(v, {
    [d]: (obj[d].constructor === Object) ? deepCopy(obj[d]) : obj[d]
  }), {});
}