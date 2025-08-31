(() => {
  const buttons = document.querySelector('.buttons');
  const display = document.getElementById('result');
  let expr = '';

  // Helper
  const isOperator = ch => ['+','-','*','/'].includes(ch);

  // Update display
  function refresh() {
    display.value = expr;
  }

  // Safe evaluation: allow only digits, operators, parentheses and dots
  function safeEval(s) {
    // trim spaces
    const cleaned = s.replace(/\s+/g, '');
    if (cleaned === '') return '';
    // only allow these chars
    if (!/^[0-9+\-*/().]+$/.test(cleaned)) {
      throw new Error('Invalid characters');
    }
    // Basic protection: avoid sequences like `++` (we already prevent some)
    // Use Function to evaluate inside strict mode
    return Function('"use strict";return (' + cleaned + ')')();
  }

  // Core input handler
  function handleInput(value) {
    if (value === 'C') {
      expr = '';
      refresh();
      return;
    }
    if (value === 'CE') {
      expr = expr.slice(0, -1);
      refresh();
      return;
    }
    if (value === '=') {
      try {
        const result = safeEval(expr);
        expr = (result === undefined || result === null) ? '' : String(result);
        refresh();
      } catch (err) {
        display.value = 'Error';
        expr = '';
      }
      return;
    }

    // Prevent two operators in a row — replace last operator
    if (isOperator(value)) {
      if (expr === '') {
        // allow negative numbers: only '-' allowed at start
        if (value === '-') { expr = '-'; refresh(); }
        return;
      }
      if (isOperator(expr.slice(-1))) {
        expr = expr.slice(0, -1) + value;
      } else {
        expr += value;
      }
      refresh();
      return;
    }

    // '.' handling: allow multiple decimals in separated numbers (simple approach)
    if (value === '.') {
      // get last number segment
      const lastNumber = expr.split(/[\+\-\*\/]/).pop();
      if (lastNumber.includes('.')) return; // ignore second dot in same number
    }

    // Append numbers / 00 / dot
    expr += value;
    refresh();
  }

  // Click handling (delegation)
  buttons.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const val = btn.dataset.value;
    if (typeof val === 'undefined') return;
    handleInput(val);
  });

  // Keyboard support
  document.addEventListener('keydown', e => {
    const k = e.key;
    // numbers 0-9, operators, parentheses, dot
    if ((k >= '0' && k <= '9') || ['+','-','*','/','.','(',')'].includes(k)) {
      handleInput(k);
      e.preventDefault();
      return;
    }
    if (k === 'Enter') { handleInput('='); e.preventDefault(); return; }
    if (k === 'Backspace') { handleInput('CE'); return; }
    if (k === 'Escape') { handleInput('C'); return; }
    // allow numeric keypad keys (numpad has same e.key values for digits/operators)
  });

  // initialize
  refresh();
})();
