export class LeanQRElement extends HTMLElement {}

declare global {
  interface HTMLElementTagNameMap {
    'lean-qr': LeanQRElement;
  }
}
