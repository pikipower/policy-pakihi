let currentStep = 0;
const sections = document.querySelectorAll("section");
const selectedPolicies = [];
const policyFiles = {
  "Governance Responsibilities": "governance.txt",
  "Volunteer Support": "volunteer.txt",
  "Privacy & Information Use": "privacy.txt",
  "Financial Management": "finance.txt",
  "Health & Safety": "health.txt"
};

function nextStep() {
  if (currentStep === 4) {
    const checkboxes = sections[currentStep].querySelectorAll("input[type='checkbox']");
    selectedPolicies.length = 0;
    checkboxes.forEach((box) => {
      if (box.checked) {
        selectedPolicies.push(box.parentElement.innerText.trim());
      }
    });
    console.log("Selected policies:", selectedPolicies);
  }

  if (currentStep < sections.length - 1) {
    sections[currentStep].classList.remove("active");
    currentStep++;
    sections[currentStep].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Placeholder for DOCX (coming next)
function downloadDocx() {
  alert("Download coming soon.");
}
