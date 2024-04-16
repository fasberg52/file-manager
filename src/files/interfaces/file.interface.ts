// file.interface.ts
export interface File {
    originalName: string;
    mimeType: string;
    size: number;
    folder: string; // Reference to the folder ID
  }
  
  // folder.interface.ts
  export interface Folder {
    name: string;
    path: string;
    files: string[]; // Array of file IDs
  }

