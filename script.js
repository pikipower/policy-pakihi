let currentStep = 0;
const sections = document.querySelectorAll("section");
const selectedPolicies = [];

function nextStep() {
  // Capture selected policies on the selection step
  if (currentStep === 4) {
    const checkboxes = sections[currentStep].querySelectorAll("input[type='checkbox']");
    selectedPolicies.length = 0; // clear previous
    checkboxes.forEach((box) => {
      if (box.checked) {
        selectedPolicies.push(box.parentElement.innerText.trim());
      }
    });
    console.log("Selected policies:", selectedPolicies);
  }

  // Go to next section
  if (currentStep < sections.length - 1) {
    sections[currentStep].classList.remove("active");
    currentStep++;
    sections[currentStep].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
