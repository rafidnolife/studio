
// This file is deprecated in favor of src/firebase/index.ts
// Exporting instances for backward compatibility
import { initializeFirebase } from '@/firebase';
const { auth, db } = initializeFirebase();
export { auth, db };
