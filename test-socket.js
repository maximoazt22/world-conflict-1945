const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('connect', () => {
    console.log('✅ Connected to server');
    socket.emit('game:join', {
        gameId: 'DEFAULT',
        playerId: 'test_player',
        username: 'TestUser',
        nation: 'china',
        color: '#ff0000'
    });
});

socket.on('game:joined', (data) => {
    console.log('🎉 Joined successfully:', JSON.stringify(data, null, 2));
    process.exit(0);
});

socket.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('⏰ Timeout reached');
    process.exit(1);
}, 5000);
