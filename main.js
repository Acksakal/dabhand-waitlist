const FUNCTION_URL = 'https://qoiwljbxdxvyfbgcrnpn.supabase.co/functions/v1/waitlist-signup';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_OKA50rOjkysHpzOF4-NbeQ_lccJ9jat';

const form = document.querySelector("#waitlist-form");
const statusEl = document.querySelector("#form-status");
const submitButton = document.querySelector("#submit-button");
const phoneInput = form.elements.phoneNumber;
const alreadyJoinedDialog = document.querySelector("#already-joined-dialog");
const alreadyJoinedDialogCloseButton = document.querySelector(
  "#already-joined-dialog-close",
);

function getNationalUsPhoneDigits(value) {
  const digits = value.replace(/\D/g, "");

  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

function formatUsPhoneNumber(value) {
  const digits = getNationalUsPhoneDigits(value).slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function showAlreadyJoinedDialog() {
  setStatus("");

  if (typeof alreadyJoinedDialog.showModal !== "function") {
    setStatus("You're already on the list.");
    return;
  }

  alreadyJoinedDialog.showModal();
}

function getFormPayload(formData) {
  return {
    accountType: formData.get("accountType"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    businessName: formData.get("businessName"),
    zipCode: formData.get("zipCode"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    company_website: formData.get("company_website"),
    source: "github-pages-waitlist",
  };
}

async function submitWaitlist(payload) {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

phoneInput.addEventListener("input", (event) => {
  event.target.value = formatUsPhoneNumber(event.target.value);
});

alreadyJoinedDialogCloseButton.addEventListener("click", () => {
  alreadyJoinedDialog.close();
});

alreadyJoinedDialog.addEventListener("click", (event) => {
  if (event.target === alreadyJoinedDialog) {
    alreadyJoinedDialog.close();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  submitButton.disabled = true;
  setStatus("Joining...");

  try {
    const data = await submitWaitlist(getFormPayload(new FormData(form)));

    if (data.alreadyJoined) {
      showAlreadyJoinedDialog();
      return;
    }

    form.reset();
    setStatus("You're on the list.");
  } catch (error) {
    setStatus(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.",
      true,
    );
  } finally {
    submitButton.disabled = false;
  }
});
