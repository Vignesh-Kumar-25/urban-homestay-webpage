document.addEventListener('DOMContentLoaded', function () {
  // Gallery filtering
  var tabs = document.querySelectorAll('.gallery-tab');
  var items = document.querySelectorAll('.gallery-item');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');

      var filter = this.getAttribute('data-filter');
      items.forEach(function (item) {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox
  var lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  var lightboxImg = lightbox.querySelector('.lightbox__image');
  var lightboxCaption = lightbox.querySelector('.lightbox__caption');
  var lightboxCounter = lightbox.querySelector('.lightbox__counter');
  var closeBtn = lightbox.querySelector('.lightbox__close');
  var prevBtn = lightbox.querySelector('.lightbox__prev');
  var nextBtn = lightbox.querySelector('.lightbox__next');

  var galleryImages = [];
  var currentIndex = 0;

  function refreshGalleryImages() {
    galleryImages = [];
    document.querySelectorAll('.gallery-item:not([style*="display: none"])').forEach(function (item) {
      galleryImages.push({
        src: item.querySelector('img').getAttribute('data-full') || item.querySelector('img').src,
        caption: item.querySelector('.gallery-item__caption')
          ? item.querySelector('.gallery-item__caption').textContent
          : ''
      });
    });
  }

  function openLightbox(index) {
    refreshGalleryImages();
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    var img = galleryImages[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.caption;
    if (lightboxCaption) lightboxCaption.textContent = img.caption;
    if (lightboxCounter) lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updateLightbox();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightbox();
  }

  items.forEach(function (item, index) {
    item.addEventListener('click', function () {
      refreshGalleryImages();
      var visibleItems = document.querySelectorAll('.gallery-item:not([style*="display: none"])');
      var visibleIndex = Array.prototype.indexOf.call(visibleItems, item);
      openLightbox(visibleIndex >= 0 ? visibleIndex : 0);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', nextImage);
  if (prevBtn) prevBtn.addEventListener('click', prevImage);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  // Touch swipe
  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    var diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  }, { passive: true });
});
