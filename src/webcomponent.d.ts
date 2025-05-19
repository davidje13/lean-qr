/** A webcomponent containing a QR code. Behaves like a `canvas`. */
export class LeanQRElement extends HTMLElement {}

declare global {
  interface HTMLElementTagNameMap {
    'lean-qr': LeanQRElement;
  }
}
