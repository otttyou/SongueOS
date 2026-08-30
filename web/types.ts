export type Theme = "dawn" | "dusk";
export type WallpaperId = "mist-river" | "moon-peak" | "bamboo-window";
export type DesktopMode = "hybrid" | "mac" | "linux";

export type AppId =
  | "files"
  | "browser"
  | "notes"
  | "photos"
  | "music"
  | "podcasts"
  | "tv"
  | "terminal"
  | "workflow"
  | "automation"
  | "settings";

export type OsWindow = {
  id: string;
  appId: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  restored?: { x: number; y: number; w: number; h: number };
};

export type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: number;
};

export type FileKind = "folder" | "text" | "image" | "audio" | "video" | "note";

export type VFile = {
  id: string;
  name: string;
  kind: FileKind;
  parentId: string | null;
  text?: string;
  src?: string;
  appHint?: AppId;
};

export type ContextMenuState = {
  x: number;
  y: number;
} | null;

export type MediaKind = "music" | "podcast" | "tv";

export type WorkflowCard = {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  status: "todo" | "progress" | "done";
};
