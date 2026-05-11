document.addEventListener('DOMContentLoaded', function () {
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
