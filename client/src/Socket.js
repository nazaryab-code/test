import SocketIO from 'socket.io-client';
import API_BASE_URL from '../src/components/apiConfig'; 

const SOCKET_URL = API_BASE_URL + '/';

let socket = SocketIO(SOCKET_URL, { transports: ['websocket'] });

export default socket;