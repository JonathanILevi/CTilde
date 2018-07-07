

struct CTT {
	Type type;
	union {
		string	str	;
		CTT[]	list	;
		CTT[string]	obj	;
	}
	
	enum Type {
		str,
		list,
		obj,
	}
}

struct CTTC {
	static {
		CTT str(string str) {
			CTT value;
			value.type	= CTT.Type.str	;
			value.str	= str	;
			return value;
		}
		CTT list(CTT[] list) {
			CTT value;
			value.type	= CTT.Type.str	;
			value.list	= list	;
			return value;
		}
		CTT obj(CTT[string] obj) {
			CTT value;
			value.type	= CTT.Type.str	;
			value.obj	= obj	;
			return value;
		}
	}
}


struct Data {
	Block[] blocks;
}
struct Block {
	string	id	;
	string	type	;
	Contact[]	ins	;
	Contact[]	outs	;
}
struct Contact {
	string	name	;
	Connection[]	connections	;
}
struct Connection {
	string block;
	string contact;
}
