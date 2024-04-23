import { join } from 'path'
import { homedir } from 'os'

const PATHS = {
  LIB: join(homedir(), 'jouley', 'lib')
}

export { PATHS }
