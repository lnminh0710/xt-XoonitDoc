//export
export * from './scanning.service';
export * from './scanning.process';

//import
import { ScanningService } from './scanning.service';
import { ScanningProcess } from './scanning.process';

export const APP_SERVICES = [ScanningService, ScanningProcess];
