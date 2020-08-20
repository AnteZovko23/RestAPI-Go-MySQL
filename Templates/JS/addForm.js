
var magicFocus,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };


magicFocus = (function() {
  function magicFocus(parent) {
    var i, input, len, ref;
    this.parent = parent;
    this.hide = bind(this.hide, this);
    this.show = bind(this.show, this);
    if (!this.parent) {
      return;
    }

    this.focus = document.createElement('div');
    this.focus.classList.add('magic-focus');
    this.parent.classList.add('has-magic-focus');
    this.parent.appendChild(this.focus);
    ref = this.parent.querySelectorAll('input, textarea, select');
    for (i = 0, len = ref.length; i < len; i++) {
      input = ref[i];
      input.addEventListener('focus', function() {
        return window.magicFocus.show();
      });
  
    }
  }

  magicFocus.prototype.show = function() {
    var base, base1, el;
    if (!(typeof (base = ['INPUT', 'SELECT', 'TEXTAREA']).includes === "function" ? base.includes((el = document.activeElement).nodeName) : void 0)) {
      return;
    }
    clearTimeout(this.reset);
    if (typeof (base1 = ['checkbox', 'radio']).includes === "function" ? base1.includes(el.type) : void 0) {
      el = document.querySelector("[for=" + el.id + "]");
    }
    this.focus.style.top = (el.offsetTop || 0) + "px";
    this.focus.style.left = (el.offsetLeft || 0) + "px";
    this.focus.style.width = (el.offsetWidth || 0) + "px";
    return this.focus.style.height = (el.offsetHeight || 0) + "px";
  };

  magicFocus.prototype.hide = function() {
    var base, el;
    if (!(typeof (base = ['INPUT', 'SELECT', 'TEXTAREA', 'LABEL']).includes === "function" ? base.includes((el = document.activeElement).nodeName) : void 0)) {
      this.focus.style.width = 0;
    }
    return this.reset = setTimeout(function() {
      return window.magicFocus.focus.removeAttribute('style');
    }, 200);
  };

  return magicFocus;

})();

window.magicFocus = new magicFocus(document.querySelector('.form'));

$(function() {
  return $('.select').customSelect();
});
