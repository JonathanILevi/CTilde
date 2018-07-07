import CTT;
import std.algorithm.searching;
import std.uni;
import std.exception:enforce;







void interpret(Data data_) {
	data = data_;
	data.block("run").preRun.postRun;
}


 



private {
	
	Data data;
	
	
	
	
	Block preRun(Block block) {
		foreach (contact; block.outs) {
			if ( (contact.name.startsWith("@preRun")||contact.name.startsWith("@prerun")) && contact.name["@preRun".length-1]!='0' && contact.name["@preRun".length..$].all!isNumber) {
				contact.run;
			}
		}
		return block;
	}
	Block postRun(Block block) {
		foreach (contact; block.outs) {
			if (contact.name.startsWith("@run") && contact.name["@run".length-1]!='0' && contact.name["@run".length..$].all!isNumber) {
				contact.run;
			}
		}
		return block;
	}
	
	Contact run (Contact contact) {
		enforce(contact.connections.length<=1);
		contact.connections[0].run;
		return contact;
	}
	Connection run(Connection connection) {
		enforce(connection.contact=="@run");
		data.block(connection.block).run;
		return connection;
	}
	Block run(Block block) {
		if (block.type.toLower=="call") {
			block.contact("func").get;
		}
		return block;
	}
	Contact getRun(Contact contact) {
		enforce(contact.connections.length<=1);
		contacts.connection[0].getRun;
		return contact;
	}
	Connection getRun(Connection connection) {
		data.block(connection.block).getRun;
	}
	Block getRun(Block block) {
		if (block.type.terLower=="call") {
			block.run;
		}
		return block;
	}
	

	
	
	
	
	
	
	
	Contact[] mainIns(Block block) {
		Contact[] contacts;
		foreach (contact; block.ins) {
			if (contact.name.startsWith("@")) {
				contacts ~= contact;
			}
		}
		return contacts;
	}
	Contact[] mainOuts(Block block) {
		Contact[] contacts;
		foreach (contact; block.outs) {
			if (contact.name.startsWith("@")) {
				contacts ~= contact;
			}
		}
		return contacts;
	}

	Block block(Data data, string id) {
		return data.blocks.block(id);
	}
	Block block(Block[] blocks, string id) {
		foreach (block; blocks) {
			if (block.id == id) {
				return block;
			}
		}
		assert(0);
	}
	Contact contact(Contact[] contacts, string name) {
		foreach (contact; contacts) {
			if (contact.name == name) {
				return contact;
			}
		}
		assert(0);
	}


}
