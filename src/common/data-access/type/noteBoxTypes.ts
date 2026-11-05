/**
 * Backend-styled note box. `message` may be markdown; the three colours are hex
 * values the backend owns. UI chrome (icons) stays client-side.
 */
export interface NoteBoxInterface {
  message: string;
  color: string;
  background_color: string;
  border_color: string;
}
