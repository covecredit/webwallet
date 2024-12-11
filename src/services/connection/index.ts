import { connectionService } from './ConnectionService';
import { connectionManager, ConnectionState } from './ConnectionManager';
import { ConnectionError, NetworkError, TimeoutError } from './errors';

export { connectionService, connectionManager, ConnectionState };
export type { ConnectionError, NetworkError, TimeoutError };
export default connectionService;