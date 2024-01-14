import LeofcoinStorage from '@leofcoin/storage'
import { ipcMain } from 'electron'
const libStorage = new LeofcoinStorage('lib', '.jouley')

ipcMain.handle('ping', () => 'pong')

ipcMain.handle('hasLib', () => libStorage.has('version'))
ipcMain.handle('createLib', () => libStorage.put('version', '0.0.1'))
