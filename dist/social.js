const socialViewer = document.querySelector('#social-viewer');
const socialAlbums = JSON.parse(document.querySelector('#social-data').textContent);
let albumIndex = 0;
let imageIndex = 0;
let albumOpener = null;
function showSocialImage() {
  const album = socialAlbums[albumIndex];
  const entry = album.images[imageIndex];
  const image = document.querySelector('#social-image');
  image.src = entry.src;
  image.alt = entry.alt;
  document.querySelector('#social-viewer-title').textContent = album.title;
  document.querySelector('#social-caption').textContent = entry.alt;
  document.querySelector('#social-counter').textContent = `${imageIndex+1} / ${album.images.length}`;
  document.querySelector('#social-prev').disabled = imageIndex === 0;
  document.querySelector('#social-next').disabled = imageIndex === album.images.length-1;
  const download = document.querySelector('#social-download');
  download.href = album.download;
  download.textContent = album.downloadLabel;
}
document.querySelectorAll('[data-album]').forEach(button=>button.addEventListener('click',()=>{
  albumOpener = button;
  albumIndex = Number(button.dataset.album);
  imageIndex = 0;
  showSocialImage();
  socialViewer.showModal();
}));
document.querySelector('#social-prev').addEventListener('click',()=>{if(imageIndex>0){imageIndex--;showSocialImage();}});
document.querySelector('#social-next').addEventListener('click',()=>{if(imageIndex<socialAlbums[albumIndex].images.length-1){imageIndex++;showSocialImage();}});
document.querySelector('#close-social').addEventListener('click',()=>socialViewer.close());
socialViewer.addEventListener('keydown',event=>{
  if (event.key==='ArrowRight' && imageIndex<socialAlbums[albumIndex].images.length-1) {event.preventDefault();imageIndex++;showSocialImage();}
  if (event.key==='ArrowLeft' && imageIndex>0) {event.preventDefault();imageIndex--;showSocialImage();}
});
socialViewer.addEventListener('close',()=>albumOpener?.focus({preventScroll:true}));
socialViewer.addEventListener('click',event=>{
  if(event.target!==socialViewer)return;
  const r=socialViewer.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)socialViewer.close();
});
document.querySelector('#social-image').addEventListener('error',()=>{
  document.querySelector('#social-caption').textContent='No se pudo cargar esta imagen. Puedes volver a abrir la colección o descargar el archivo.';
});
