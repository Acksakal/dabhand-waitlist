const FUNCTION_URL = 'https://qoiwljbxdxvyfbgcrnpn.supabase.co/functions/v1/waitlist-signup';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OKA50rOjkysHpzOF4-NbeQ_lccJ9jat';

const form = document.querySelector('#waitlist-form');
const statusEl = document.querySelector('#form-status');
const submitButton = document.querySelector('#submit-button');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function getFormPayload(formData) {
  return {
    accountType: formData.get('accountType'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    businessName: formData.get('businessName'),
    zipCode: formData.get('zipCode'),
    email: formData.get('email'),
    phoneNumber: formData.get('phoneNumber'),
    company_website: formData.get('company_website'),
    source: 'github-pages-waitlist',
  };
}

async function submitWaitlist(payload) {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok) {
    throw new Error(data.error || 'Something went wrong. Please try again.');
  }

  return data;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  submitButton.disabled = true;
  setStatus('Joining...');

  try {
    const data = await submitWaitlist(getFormPayload(new FormData(form)));

    if (data.alreadyJoined) {
      setStatus("You're already on the list.");
      return;
    }

    form.reset();
    setStatus("You're on the list.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : 'Something went wrong. Please try again.', true);
  } finally {
    submitButton.disabled = false;
  }
});