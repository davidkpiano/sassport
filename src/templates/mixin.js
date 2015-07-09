export default function(signature, id) {
  return `
    @mixin ${signature} {
      @include __sassport-mixin(${id}) {
        @content;
      }
    }
  `;
}