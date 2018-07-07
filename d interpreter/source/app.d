import std.stdio;
import CTT;
import Interpret;


void main() {
	////with (CTTC) {
	////	testData = obj([
	////		"blocks":list([
	////			obj([
	////				"id":str("import"),
	////				"type":str("Import"),
	////				"ins":list([
	////				]),
	////				"outs":list([
	////					obj([
	////						"name":str("Std.write"),
	////						"connections":list([
	////							obj([
	////								"connectionBlock":str("write"),
	////								"connectionContact":str("func"),
	////							])
	////						])
	////					]),
	////				])
	////			]),
	////			obj([
	////				"id":str("run"),
	////				"type":str("Run"),
	////				"ins":list([
	////				]),
	////				"outs":list([
	////					obj([
	////						"name":str("run"),
	////						"connections":list([
	////							obj([
	////								"connectionBlock":str("write"),
	////								"connectionContact":str("run"),
	////							])
	////						])
	////					])	
	////				])
	////			]),
	////			obj([
	////				"id":str("write"),
	////				"type":str("Call"),
	////				"ins":list([
	////					obj([
	////						"name":str("run"),
	////						"connections":list([
	////							obj([
	////								"connectionBlock":str("run"),
	////								"connectionContact":str("run"),
	////							])
	////						])
	////					]),
	////					obj([
	////						"name":str("func"),
	////						"connections":list([
	////							obj([
	////								"connectionBlock":str("import"),
	////								"connectionContact":str("Std.write"),
	////							])
	////						])
	////					]),
	////					obj([
	////						"name":str("value"),
	////						"connections":list([
	////							obj([
	////								"connectionBlock":str("string"),
	////								"connectionContact":str("Hello World!"),
	////							])
	////						])
	////					]),
	////				]),
	////				"outs":list([
	////				])
	////			]),
	////			obj([
	////				"id":str("string"),
	////				"type":str("Value"),
	////				"ins":list([
	////					obj([
	////						"name":str("String"),
	////						"connections":list([
	////						])
	////					]),
	////				]),
	////				"outs":list([
	////					obj([
	////						"name":str("Hello World!"),
	////						"connections":list([
	////							obj([
	////								"connectionBlock":str("write"),
	////								"connectionContact":str("value"),
	////							])
	////						])
	////					])
	////				])
	////			]),
	////		])
	////	]);
	////}
	////
	////with (CTTC) {
	////	
	////}
	
	interpret(testData);
}

////CTT testData;


Data testData = Data(
	[	Block(	"Import",
			[],
			[	Contact(	"Std.write",
					[	Connection(	"write"	,
							"func"	,)
					]
				),
			]
		),
		Block(	"run",
			"Run",
			[],
			[	Contact(	"run",
					[	Connection(	"write"	,
							"run"	,)
					]
				)
			]
		),
		Block(	"write",
			"Call",
			[	Contact(	"run",
					[	Connection(	"run"	,
							"run"	,)
					]
				),
				Contact(	"func",
					[	Connection(	"import"	,
							"Std.write"	,)
					]
				),
				Contact(	"value",
					[	Connection(	"string"	,
							"Hello World!"	,)
					]
				),
			],
			[]
		),
		Block(	"string",
			"Value",
			[	Contact(	"String",
					[
					]
				),
			],
			[	Contact(	"Hello World!",
					[	Connection(	"write"	,
							"value"	,)
					]
				)
			]
		),
	]
);

