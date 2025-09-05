// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registroForm');

  // Toggle mostrar / ocultar contraseña
  document.querySelectorAll('.toggle-pass').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const input = document.getElementById(target);
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁️' : '🙈';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmar = document.getElementById('confirmar').value;

    if (password !== confirmar) {
      return alert('Las contraseñas no coinciden ❌');
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');

      const btn = document.querySelector('.btn');
      btn.innerText = '¡Registrado!';
      btn.style.background = 'var(--verde-oscuro)';
      btn.style.transform = 'scale(1.1)';
      setTimeout(() => btn.style.transform = 'scale(1)', 300);

      alert('¡Registro exitoso! ✅');
      form.reset();
    } catch (err) {
      alert('Error: ' + err.message);
      console.error(err);
    }
  });
});
