document.addEventListener('DOMContentLoaded', function () {
  // Show success/error notification from form submission redirect
  var params = new URLSearchParams(window.location.search);
  if (params.has('sent') || params.has('error')) {
    var isSuccess = params.has('sent');
    var toast = document.createElement('div');
    toast.className = 'form-toast ' + (isSuccess ? 'form-toast--success' : 'form-toast--error');
    toast.setAttribute('role', 'alert');
    toast.innerHTML =
      '<div class="form-toast__content">' +
        '<svg class="form-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          (isSuccess
            ? '<path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
            : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>') +
        '</svg>' +
        '<span>' +
          (isSuccess
            ? 'Your enquiry has been sent successfully! We will get back to you within 24 hours.'
            : 'Something went wrong. Please try again or contact us directly at +91 7760634848.') +
        '</span>' +
      '</div>' +
      '<button class="form-toast__close" aria-label="Dismiss">&times;</button>';

    var form = document.querySelector('.js-validate');
    if (form) form.parentNode.insertBefore(toast, form);

    toast.querySelector('.form-toast__close').addEventListener('click', function () {
      toast.classList.add('form-toast--hiding');
      setTimeout(function () { toast.remove(); }, 300);
    });

    if (isSuccess) {
      setTimeout(function () {
        toast.classList.add('form-toast--hiding');
        setTimeout(function () { toast.remove(); }, 300);
      }, 8000);
    }

    // Clean up the URL
    window.history.replaceState({}, '', window.location.pathname);
  }

  var forms = document.querySelectorAll('.js-validate');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var isValid = true;

      form.querySelectorAll('.form-group').forEach(function (group) {
        group.classList.remove('has-error');
      });

      form.querySelectorAll('[required]').forEach(function (input) {
        var group = input.closest('.form-group');
        var value = input.value.trim();

        if (!value) {
          isValid = false;
          group.classList.add('has-error');
          input.classList.add('error');
          return;
        }

        input.classList.remove('error');

        if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false;
          group.classList.add('has-error');
          input.classList.add('error');
          var errorEl = group.querySelector('.form-error');
          if (errorEl) errorEl.textContent = 'Please enter a valid email address';
        }

        if (input.type === 'tel' && !/^[\d\s\+\-()]{7,}$/.test(value)) {
          isValid = false;
          group.classList.add('has-error');
          input.classList.add('error');
          var errorEl = group.querySelector('.form-error');
          if (errorEl) errorEl.textContent = 'Please enter a valid phone number';
        }
      });

      if (!isValid) {
        e.preventDefault();
        var firstError = form.querySelector('.has-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(function (input) {
      input.addEventListener('input', function () {
        var group = this.closest('.form-group');
        if (group) {
          group.classList.remove('has-error');
          this.classList.remove('error');
        }
      });
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq__item');
      var answer = item.querySelector('.faq__answer');
      var isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq__item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq__answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});
