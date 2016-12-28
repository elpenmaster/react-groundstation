
module.exports = function (io, udp, room, logger)
{
	var _timer;
	
	// socket.io demo
	io.on('connection', function (socket) {

	  console.log("started listening")

	  if(!udp.rx.listeningForUdp)
		startListening();

	  function startListening(){ // listen for udp packets
		udp.rx.listeningForUdp = true;
		udp.rx.server().on('message', function (message, remote) {
			console.log("GROUNSTATION UDP - RECEIVED: " + remote.address + ':' + remote.port +' - ' + message);
			logger.log("debug", "GROUNSTATION UDP - RECEIVED: " + remote.address + ':' + remote.port +' - ' + message);

			if(updateClientWithDatalogs)
			{
			  socket.in('dataLogging').emit('udp:event', {
				log: remote.address + ':' + remote.port +' - ' + message
			  });
			}
		});
	  }

	  var websocket = {};
	  websocket.events = {
		'forceDisconnect': function(){
		  socket.disconnect();
		},
		'XilinxSim:StartRun': function (data){ 
		  udp.tx.UDPSafe_Tx_X4("129.168.1.170", 9170, 0); 
		},
		'FlightControl_Accel:StartStream': function (data){ 
		  udp.tx.UDPSafe_Tx_X4("127.0.0.1", 9100, 0x0100, 0x00000001, 0x00001001); 
		},
		'stop:Pod': function (data) {
		  udp.tx.sendMessage('STOP');
		},
		'client event': function (data) {
		  socket.broadcast.emit('update label', data);
		},
		'start:dataLogs': function (data) {
		  if(_timer)
		  {
			clearInterval(_timer)
		  }

		  _timer = setInterval(function(){
			  udp.tx.sendMessage("Thanks Pod, message received")
		  }, 2500);
		  updateClientWithDatalogs = true;
		},
		'stop:dataLogs': function (data) {
		  if(_timer)
		  {
			clearInterval(_timer)
		  }

		  udp.tx.sendMessage("DataLogs are no longer listening")
		  updateClientWithDatalogs = false;
		},
		'join': function (data) {
			var name = data.name;
			room[data.room] = data.room; //add name of room to the list of rooms
			socket.join(room[data.room]);
			console.log(name + ' joined the group. '+ socket.id);
			socket.in(room[data.room]).emit('udp:event', {log: name + ' joined the group: ' + room[data.room]});
		},
		'sendParameter': function (data) {
		  udp.tx.sendMessage(JSON.stringify(data))
		},
		'setIpAndPort': function (data) {
		  udp.rx.updateConnectionData(data).then(() => {
			console.log('udp starting to listen again')
			if(!udp.rx.listeningForUdp)
				startListening()
		  })

		  udp.tx.sendMessage(JSON.stringify(data))
		},
		'disconnect': function() {
		  console.log('Server got disconnected!');
		}
	  }

	  for (const event in websocket.events){
		  socket.on (event, (data)=> {
			websocket.events[event](data);
		  })
	  }
	});
};