const modal = document.getElementById('signupModal');
  modal.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    alert(result.message || result.error);
  });
//buttons//
 const openBtn = document.getElementById('openSignUpBtn');
  const signUpModal = document.getElementById('signUpModal');

  openBtn.addEventListener('click', () => {
    signUpModal.classList.remove('hidden');
    signUpModal.classList.add('signup-modal'); // apply styles
  const closeBtn = document.getElementById('closeModal');

  closeBtn.addEventListener('click', () => {
    signUpModal.classList.add('hidden');
  });
  });
