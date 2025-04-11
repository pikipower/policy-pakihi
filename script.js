// ----- GLOBAL STATE -----

let currentStep = 0;
const sections = document.querySelectorAll("section.step");
const selectedPolicies = [];
const policyFiles = {
  "Governance Responsibilities": "governance.txt",
  "Volunteer Support": "volunteer.txt",
  "Privacy & Information Use": "privacy.txt",
  "Financial Management": "finance.txt",
  "Health & Safety": "health.txt"
};

// ----- NAVIGATION -----

function nextStep() {
  // On the policy selection step, update selectedPolicies list
  if (currentStep === 4) {
    const checkboxes = sections[currentStep].querySelectorAll("input[type='checkbox']");
    selectedPolicies.length = 0;
    checkboxes.forEach((box) => {
      if (box.checked) {
        selectedPolicies.push(box.parentElement.innerText.trim());
      }
    });
  }

  if (currentStep < sections.length - 1) {
    sections[currentStep].classList.remove("active");
    currentStep++;
    sections[currentStep].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function prevStep() {
  if (currentStep > 0) {
    sections[currentStep].classList.remove("active");
    currentStep--;
    sections[currentStep].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Keyboard navigation (Right = next, Left = back, Space = next)
document.addEventListener('keydown', function (e) {
  const tag = document.activeElement.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextStep();
  }

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevStep();
  }
});


// ----- POLICY PREVIEW MODAL -----

function previewPolicy(policyName, filename) {
  const modal = document.querySelector('[x-data*="policyContent"]').__x;

  modal.$data.policyTitle = policyName;
  modal.$data.policyContent = '<p>Loading policy content...</p>';
  modal.$data.open = true;

  fetch(`templates/${filename}`)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load policy');
      return response.text();
    })
    .then(text => {
      // Format plain text to basic HTML
      const htmlContent = text
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p>${line}</p>`)
        .join('');
      modal.$data.policyContent = htmlContent;
    })
    .catch(error => {
      modal.$data.policyContent = `<p class="text-red-600">Error loading policy: ${error.message}</p>`;
    });
}


// ----- POLICY DOCX DOWNLOAD -----

async function downloadDocx() {
  // Create loading overlay
  const loadingEl = document.createElement('div');
  loadingEl.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  loadingEl.innerHTML = `
    <div class="bg-white p-6 rounded-lg shadow-xl text-center">
      <div class="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
      <p class="text-text">Generating your policy document...</p>
    </div>
  `;
  document.body.appendChild(loadingEl);

  const doc = new window.docx.Document();
  const content = [];

  for (const policyName of selectedPolicies) {
    const filename = policyFiles[policyName];
    if (!filename) continue;

    try {
      const response = await fetch(`templates/${filename}`);
      if (!response.ok) throw new Error(`Failed to load ${filename}`);

      const text = await response.text();
      content.push(new window.docx.Paragraph({ text: policyName, heading: window.docx.HeadingLevel.HEADING_1 }));

      text.split('\n').forEach(line => {
        content.push(new window.docx.Paragraph(line));
      });

      content.push(new window.docx.Paragraph("")); // spacing
    } catch (err) {
      document.body.removeChild(loadingEl);
      showToast(`Error: ${err.message}`, "error");
      return;
    }
  }

  doc.addSection({ children: content });

  try {
    const blob = await window.docx.Packer.toBlob(doc);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Policy-Kete.docx";
    link.click();

    document.body.removeChild(loadingEl);
    showToast("Document generated successfully!", "success");
  } catch (err) {
    document.body.removeChild(loadingEl);
    showToast(`Error exporting document: ${err.message}`, "error");
  }
}

// ----- TOAST MESSAGES -----

function showToast(message, type = "info") {
  const toast = document.createElement('div');
  const colours = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-primary'
  };

  toast.className = `fixed bottom-4 right-4 ${colours[type]} text-white px-4 py-2 rounded shadow-lg z-50`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
